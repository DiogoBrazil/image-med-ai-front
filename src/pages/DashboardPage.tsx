import { useEffect } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  SimpleGrid, 
  Stat, 
  StatLabel, 
  StatNumber, 
  StatHelpText, 
  Flex,
  Icon,
  Button,
  useColorModeValue,
  Divider,
  Card,
  CardHeader,
  CardBody,
  CardFooter
} from '@chakra-ui/react';
import { FiUsers, FiActivity, FiHome, FiCalendar, FiPlus, FiBarChart2 } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'react-query';
import api from '../services/api';
import { ApiResponse, PaginatedResponse, Attendance, HealthUnit, User } from '../types';
import * as React from 'react';

const DashboardCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ReactElement;
  helpText?: string;
  colorScheme?: string;
}> = ({ title, value, icon, helpText, colorScheme = 'primary' }) => {
  return (
    <Card
      p={5}
      borderRadius="lg"
      boxShadow="md"
      bg={useColorModeValue('white', 'gray.700')}
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
        borderColor: `${colorScheme}.200`,
      }}
      transition="all 0.3s"
      overflow="hidden"
      position="relative"
      height="100%"
    >
      <Flex justify="space-between" align="flex-start">
        <Stat>
          <StatLabel fontSize="sm" fontWeight="medium" color="gray.500">
            {title}
          </StatLabel>
          <StatNumber fontSize="3xl" fontWeight="bold" color={`${colorScheme}.600`}>
            {value}
          </StatNumber>
          {helpText && (
            <StatHelpText fontSize="sm" color="gray.500">
              {helpText}
            </StatHelpText>
          )}
        </Stat>
        <Flex
          w="40px"
          h="40px"
          align="center"
          justify="center"
          borderRadius="full"
          bg={`${colorScheme}.100`}
          color={`${colorScheme}.600`}
        >
          {icon}
        </Flex>
      </Flex>
      <Box
        position="absolute"
        bottom="-10px"
        right="-10px"
        opacity="0.1"
        zIndex="0"
      >
        <Box
          as={icon.type as React.ElementType}
          color={`${colorScheme}.500`}
          fontSize="80px"
        />
      </Box>
    </Card>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  buttonText: string;
  to: string;
  colorScheme?: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, buttonText, to, colorScheme = 'primary' }) => {
  return (
    <Card
      height="100%"
      boxShadow="md"
      borderRadius="lg"
      overflow="hidden"
      _hover={{
        transform: 'translateY(-5px)',
        boxShadow: 'lg',
      }}
      transition="all 0.3s"
    >
      <CardHeader bg={`${colorScheme}.50`} py={4}>
        <Flex align="center" gap={3}>
          <Flex
            w="40px"
            h="40px"
            align="center"
            justify="center"
            borderRadius="full"
            bg={`${colorScheme}.100`}
            color={`${colorScheme}.600`}
          >
            {icon}
          </Flex>
          <Heading size="md" color={`${colorScheme}.700`}>
            {title}
          </Heading>
        </Flex>
      </CardHeader>
      <CardBody>
        <Text>{description}</Text>
      </CardBody>
      <CardFooter>
        <Button
          as={Link}
          to={to}
          colorScheme={colorScheme}
          rightIcon={<Icon as={FiPlus} />}
          width="full"
        >
          {buttonText}
        </Button>
      </CardFooter>
    </Card>
  );
};

const DashboardPage: React.FC = () => {
  const { authState } = useAuth();
  const userProfile = authState.user?.profile;
  const isAdmin = userProfile === 'administrator' || userProfile === 'general_administrator';
  const isProfessional = userProfile === 'professional';

  // Fetch attendances (limited to recent ones)
  const attendanceQuery = useQuery('recent-attendances', async () => {
    const response = await api.get<PaginatedResponse<{ attendances: Attendance[] }>>('/api/attendances?page=1&per_page=5');
    return response.data;
  }, {
    enabled: !!authState.isAuthenticated,
  });

  // Fetch health units if admin
  const healthUnitsQuery = useQuery('health-units', async () => {
    const response = await api.get<ApiResponse<{ health_units: HealthUnit[], count: number }>>('/api/health-units');
    return response.data;
  }, {
    enabled: !!authState.isAuthenticated && isAdmin,
  });

  // Fetch users if admin
  const usersQuery = useQuery('users', async () => {
    const response = await api.get<ApiResponse<{ users: User[], count: number }>>('/api/users');
    return response.data;
  }, {
    enabled: !!authState.isAuthenticated && isAdmin,
  });

  const buildActionCards = () => {
    const cards = [];

    if (isProfessional) {
      cards.push(
        <ActionCard
          key="new-prediction"
          title="Nova Predição"
          description="Realize uma nova predição em imagens médicas usando nossos modelos de IA"
          icon={<Icon as={FiActivity} fontSize="xl" />}
          buttonText="Fazer Predição"
          to="/predictions"
          colorScheme="primary"
        />,
        <ActionCard
          key="new-attendance"
          title="Novo Atendimento"
          description="Registre um novo atendimento com diagnóstico assistido"
          icon={<Icon as={FiCalendar} fontSize="xl" />}
          buttonText="Criar Atendimento"
          to="/attendances/new"
          colorScheme="secondary"
        />
      );
    }

    if (isAdmin) {
      cards.push(
        <ActionCard
          key="new-user"
          title="Novo Usuário"
          description="Adicione um novo profissional ou administrador ao sistema"
          icon={<Icon as={FiUsers} fontSize="xl" />}
          buttonText="Adicionar Usuário"
          to="/users/new"
          colorScheme="primary"
        />,
        <ActionCard
          key="new-health-unit"
          title="Nova Unidade"
          description="Cadastre uma nova unidade de saúde em sua rede"
          icon={<Icon as={FiHome} fontSize="xl" />}
          buttonText="Adicionar Unidade"
          to="/health-units/new"
          colorScheme="secondary"
        />,
        <ActionCard
          key="statistics"
          title="Estatísticas"
          description="Visualize estatísticas de uso e precisão dos modelos de diagnóstico"
          icon={<Icon as={FiBarChart2} fontSize="xl" />}
          buttonText="Ver Estatísticas"
          to="/statistics"
          colorScheme="green"
        />
      );
    }

    return cards;
  };

  return (
    <Box>
      <Heading mb={6} color="primary.700">Dashboard</Heading>
      
      <Text fontSize="xl" mb={8} color="gray.600">
        Bem-vindo(a), {authState.user?.name}! Aqui está um resumo do seu sistema.
      </Text>

      {/* Stats Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 2, lg: 4 }} spacing={6} mb={10}>
        {isAdmin && (
          <>
            <DashboardCard
              title="Profissionais"
              value={usersQuery.data?.detail.count || 0}
              icon={<Icon as={FiUsers} fontSize="xl" />}
              helpText="Total de profissionais"
              colorScheme="primary"
            />
            <DashboardCard
              title="Unidades"
              value={healthUnitsQuery.data?.detail.count || 0}
              icon={<Icon as={FiHome} fontSize="xl" />}
              helpText="Unidades de saúde"
              colorScheme="secondary"
            />
          </>
        )}
        
        <DashboardCard
          title="Atendimentos"
          value={attendanceQuery.data?.detail.pagination.total_count || 0}
          icon={<Icon as={FiActivity} fontSize="xl" />}
          helpText="Total de diagnósticos"
          colorScheme={isAdmin ? "green" : "primary"}
        />
        
        <DashboardCard
          title="Predições Hoje"
          value={0} // This would need a specialized endpoint
          icon={<Icon as={FiCalendar} fontSize="xl" />}
          helpText="Nas últimas 24 horas"
          colorScheme={isAdmin ? "orange" : "secondary"}
        />
      </SimpleGrid>

      <Heading size="md" mb={4} color="primary.700">
        Ações Rápidas
      </Heading>
      
      {/* Action Cards */}
      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={6} mb={10}>
        {buildActionCards()}
      </SimpleGrid>

      <Heading size="md" mb={4} mt={10} color="primary.700">
        Últimos Atendimentos
      </Heading>
      
      {/* Recent Attendances */}
      {attendanceQuery.isLoading ? (
        <Text>Carregando atendimentos...</Text>
      ) : attendanceQuery.isError ? (
        <Text color="red.500">Erro ao carregar atendimentos</Text>
      ) : attendanceQuery.data?.detail.attendances.length === 0 ? (
        <Text>Nenhum atendimento registrado ainda.</Text>
      ) : (
        <Box 
          bg="white" 
          borderRadius="lg" 
          boxShadow="md" 
          overflow="hidden"
        >
          {attendanceQuery.data?.detail.attendances.map((attendance, index) => (
            <React.Fragment key={attendance.id}>
              <Flex p={4} justify="space-between" align="center">
                <Box>
                  <Text fontWeight="medium">
                    Modelo: {attendance.model_used}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Resultado: {attendance.model_result}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {new Date(attendance.attendance_date).toLocaleString()}
                  </Text>
                </Box>
                <Button
                  as={Link}
                  to={`/attendances/${attendance.id}`}
                  size="sm"
                  colorScheme="primary"
                  variant="outline"
                >
                  Ver detalhes
                </Button>
              </Flex>
              {index < (attendanceQuery.data?.detail.attendances.length || 0) - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;