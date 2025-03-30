import { useState } from 'react';
import {
  Box,
  Heading,
  SimpleGrid,
  Text,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardHeader,
  CardBody,
  Select,
  Spinner,
  Center,
  Alert,
  AlertIcon,
  Flex
} from '@chakra-ui/react';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { Statistics } from '../../types';
import { Bar, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

const StatisticsPage: React.FC = () => {
  const [period, setPeriod] = useState<string>('monthly');

  // Fetch statistics from API
  const { data: statistics, isLoading, error } = useQuery<Statistics>(
    ['statistics', period],
    async () => {
      try {
        // Convert period to start_date and end_date
        let startDate = new Date();
        let endDate = new Date();
        
        switch(period) {
          case 'weekly':
            startDate.setDate(startDate.getDate() - 7);
            break;
          case 'monthly':
            startDate.setMonth(startDate.getMonth() - 1);
            break;
          case 'quarterly':
            startDate.setMonth(startDate.getMonth() - 3);
            break;
          case 'yearly':
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
          case 'all':
            startDate = new Date(2020, 0, 1); // Set a past date to get all data
            break;
        }
        
        const formatDate = (date: Date) => {
          return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        };
        
        // Add a small delay to ensure the request completes properly (workaround for timing issues)
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const response = await api.get(
          `/api/attendances/statistics/summary?start_date=${formatDate(startDate)}&end_date=${formatDate(endDate)}`
        );
        
        console.log('Statistics API response:', response.data);
        
        // Return the data if available or create a default statistics object
        if (response.data?.detail) {
          return response.data.detail;
        }
        
        // Create a default statistics object with empty data
        console.error('API response missing expected structure');
        return {
          period: period,
          model_usage: {},
          model_accuracy: {},
          message: 'No data available for the selected period'
        };
      } catch (err) {
        console.error('Error fetching statistics:', err);
        throw err;
      }
    },
    {
      // Add retry to handle potential API connection issues
      retry: 2,
      retryDelay: 1000,
      // Don't refetch on window focus to prevent unnecessary requests
      refetchOnWindowFocus: false
    }
  );

  // Prepare data for model usage chart
  const modelUsageData = {
    labels: statistics?.model_usage ? Object.keys(statistics.model_usage).map(getModelDisplayName) : [],
    datasets: [
      {
        label: 'Utilizações',
        data: statistics?.model_usage ? Object.values(statistics.model_usage) : [],
        backgroundColor: [
          'rgba(0, 102, 255, 0.7)',
          'rgba(255, 226, 0, 0.7)',
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
        ],
        borderColor: [
          'rgba(0, 102, 255, 1)',
          'rgba(255, 226, 0, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Prepare data for accuracy chart
  const prepareAccuracyData = () => {
    if (!statistics || !statistics.model_accuracy) return null;
    
    const labels = Object.keys(statistics.model_accuracy).map(getModelDisplayName);
    const correctData = Object.values(statistics.model_accuracy).map(item => item.correct);
    const incorrectData = Object.values(statistics.model_accuracy).map(item => item.total - item.correct);
    
    return {
      labels,
      datasets: [
        {
          label: 'Diagnósticos Corretos',
          data: correctData,
          backgroundColor: 'rgba(75, 192, 92, 0.7)',
          borderColor: 'rgba(75, 192, 92, 1)',
          borderWidth: 1,
        },
        {
          label: 'Diagnósticos Incorretos',
          data: incorrectData,
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const accuracyData = prepareAccuracyData();

  // Helper function to get display name for models
  function getModelDisplayName(modelKey: string) {
    const modelNames: Record<string, string> = {
      'respiratory': 'Respiratório',
      'tuberculosis': 'Tuberculose',
      'osteoporosis': 'Osteoporose',
      'breast': 'Câncer de Mama'
    };
    return modelNames[modelKey] || modelKey;
  }

  // Calculate total statistics
  const calculateTotals = () => {
    if (!statistics || !statistics.model_usage || !statistics.model_accuracy) {
      return { totalUsage: 0, totalAccuracy: 0, totalCorrect: 0, totalDiagnoses: 0 };
    }

    const totalUsage = Object.values(statistics.model_usage).reduce((sum, value) => sum + value, 0);
    
    let totalCorrect = 0;
    let totalDiagnoses = 0;
    
    Object.values(statistics.model_accuracy).forEach(model => {
      totalCorrect += model.correct;
      totalDiagnoses += model.total;
    });
    
    const totalAccuracy = totalDiagnoses > 0 ? (totalCorrect / totalDiagnoses) * 100 : 0;
    
    return { totalUsage, totalAccuracy, totalCorrect, totalDiagnoses };
  };

  const { totalUsage, totalAccuracy, totalCorrect, totalDiagnoses } = calculateTotals();

  if (isLoading) {
    return (
      <Center h="60vh">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Center>
    );
  }

  if (error) {
    console.error('Statistics error:', error);
    return (
      <Box p={8}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          Erro ao carregar estatísticas. Por favor, tente novamente mais tarde.
        </Alert>
        <Button onClick={() => window.location.reload()} colorScheme="blue">
          Tentar novamente
        </Button>
      </Box>
    );
  }
  
  // If there's no data but also no error, show empty state
  if (!statistics || (Object.keys(statistics.model_usage || {}).length === 0 && 
      Object.keys(statistics.model_accuracy || {}).length === 0)) {
    return (
      <Box py={8}>
        <Flex justifyContent="space-between" alignItems="center" mb={6}>
          <Heading size="lg">Estatísticas</Heading>
          <Select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            maxW="200px"
          >
            <option value="weekly">Semanal</option>
            <option value="monthly">Mensal</option>
            <option value="quarterly">Trimestral</option>
            <option value="yearly">Anual</option>
            <option value="all">Todo o período</option>
          </Select>
        </Flex>
        
        <Alert status="info" mb={6}>
          <AlertIcon />
          Não existem dados estatísticos disponíveis para o período selecionado.
        </Alert>
      </Box>
    );
  }

  return (
    <Box py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Estatísticas</Heading>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          maxW="200px"
        >
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
          <option value="quarterly">Trimestral</option>
          <option value="yearly">Anual</option>
          <option value="all">Todo o período</option>
        </Select>
      </Flex>

      {/* Summary Stats */}
      <SimpleGrid columns={{ base: 1, md: 2, xl: 4 }} spacing={6} mb={8}>
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Total de Diagnósticos</StatLabel>
              <StatNumber>{totalUsage}</StatNumber>
              <StatHelpText>No período selecionado</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Precisão Média</StatLabel>
              <StatNumber>{totalAccuracy.toFixed(1)}%</StatNumber>
              <StatHelpText>{totalCorrect} diagnósticos corretos de {totalDiagnoses}</StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Modelo Mais Utilizado</StatLabel>
              <StatNumber>
                {statistics && statistics.model_usage && Object.keys(statistics.model_usage).length > 0 ? 
                  getModelDisplayName(Object.entries(statistics.model_usage)
                    .sort((a, b) => b[1] - a[1])[0][0]) : 
                  'N/A'}
              </StatNumber>
              <StatHelpText>
                {statistics && statistics.model_usage && Object.keys(statistics.model_usage).length > 0 ? 
                  `${Object.entries(statistics.model_usage).sort((a, b) => b[1] - a[1])[0][1]} diagnósticos` : 
                  'Nenhum diagnóstico registrado'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody>
            <Stat>
              <StatLabel>Modelo Mais Preciso</StatLabel>
              <StatNumber>
                {statistics && statistics.model_accuracy && Object.keys(statistics.model_accuracy).length > 0 ?
                  getModelDisplayName(Object.entries(statistics.model_accuracy)
                    .filter(([_, value]) => value.total > 0)
                    .sort((a, b) => b[1].accuracy_percentage - a[1].accuracy_percentage)[0]?.[0] || '') :
                  'N/A'}
              </StatNumber>
              <StatHelpText>
                {statistics && statistics.model_accuracy && Object.keys(statistics.model_accuracy).length > 0 ?
                  Object.entries(statistics.model_accuracy)
                    .filter(([_, value]) => value.total > 0)
                    .sort((a, b) => b[1].accuracy_percentage - a[1].accuracy_percentage)[0]?.[1].accuracy_percentage.toFixed(1) + '%' :
                  'Sem dados suficientes'}
              </StatHelpText>
            </Stat>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Charts */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Card>
          <CardHeader>
            <Heading size="md">Uso dos Modelos</Heading>
          </CardHeader>
          <CardBody>
            {statistics && statistics.model_usage && Object.keys(statistics.model_usage).length > 0 ? (
              <Box h="300px">
                <Pie data={modelUsageData} options={{ maintainAspectRatio: false }} />
              </Box>
            ) : (
              <Center h="300px">
                <Text>Nenhum dado disponível para o período selecionado</Text>
              </Center>
            )}
          </CardBody>
        </Card>
        
        <Card>
          <CardHeader>
            <Heading size="md">Precisão dos Modelos</Heading>
          </CardHeader>
          <CardBody>
            {accuracyData && Object.values(statistics?.model_accuracy || {}).some(item => item.total > 0) ? (
              <Box h="300px">
                <Bar 
                  data={accuracyData} 
                  options={{
                    maintainAspectRatio: false,
                    scales: {
                      y: {
                        beginAtZero: true,
                        stacked: true
                      },
                      x: {
                        stacked: true
                      }
                    }
                  }}
                />
              </Box>
            ) : (
              <Center h="300px">
                <Text>Nenhum dado de precisão disponível para o período selecionado</Text>
              </Center>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
    </Box>
  );
};

export default StatisticsPage;