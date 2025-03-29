import { useState } from 'react';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Button,
  Flex,
  useToast,
  Icon,
  Text,
  Image,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  Spinner,
  Link as ChakraLink,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiSearch, FiPlus, FiEye } from 'react-icons/fi';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import api from '../../services/api';
import { Attendance } from '../../types';
import { useAuth } from '../../context/AuthContext';

const AttendancesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [modelFilter, setModelFilter] = useState<string>('all');
  const [diagnosisFilter, setDiagnosisFilter] = useState<string>('all');
  const navigate = useNavigate();
  const { authState } = useAuth();
  const toast = useToast();

  // Fetch attendances from API
  const { data: attendancesData, isLoading, error } = useQuery(
    ['attendances'],
    async () => {
      const response = await api.get('/api/attendances');
      return response.data.detail.attendances;
    }
  );

  // Filter attendances based on search and filters
  const filteredAttendances = attendancesData?.filter((attendance: Attendance) => {
    const matchesSearch = searchTerm === '' || attendance.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModel = modelFilter === 'all' || attendance.model_used === modelFilter;
    const matchesDiagnosis = diagnosisFilter === 'all' || 
      (diagnosisFilter === 'correct' && attendance.correct_diagnosis) || 
      (diagnosisFilter === 'incorrect' && !attendance.correct_diagnosis);
    
    return matchesSearch && matchesModel && matchesDiagnosis;
  });

  // Get display name for models
  const getModelDisplayName = (modelKey: string) => {
    const modelNames: Record<string, string> = {
      'respiratory': 'Respiratório',
      'tuberculosis': 'Tuberculose',
      'osteoporosis': 'Osteoporose',
      'breast': 'Câncer de Mama'
    };
    return modelNames[modelKey] || modelKey;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Get badge color based on diagnosis correctness
  const getBadgeColor = (isCorrect: boolean) => {
    return isCorrect ? 'green' : 'red';
  };

  if (isLoading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" mb={6}>
        <AlertIcon />
        Erro ao carregar atendimentos. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }

  return (
    <Box py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Atendimentos</Heading>
        {authState.user?.profile === 'professional' && (
          <Button
            leftIcon={<FiPlus />}
            colorScheme="primary"
            onClick={() => navigate('/attendances/new')}
          >
            Novo Atendimento
          </Button>
        )}
      </Flex>

      <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup maxW={{ base: '100%', md: '50%' }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Flex gap={4}>
          <Select
            value={modelFilter}
            onChange={(e) => setModelFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">Todos Modelos</option>
            <option value="respiratory">Respiratório</option>
            <option value="tuberculosis">Tuberculose</option>
            <option value="osteoporosis">Osteoporose</option>
            <option value="breast">Câncer de Mama</option>
          </Select>

          <Select
            value={diagnosisFilter}
            onChange={(e) => setDiagnosisFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">Todos Diagnósticos</option>
            <option value="correct">Corretos</option>
            <option value="incorrect">Incorretos</option>
          </Select>
        </Flex>
      </Flex>

      {filteredAttendances?.length === 0 ? (
        <Alert status="info">
          <AlertIcon />
          Nenhum atendimento encontrado com os filtros selecionados.
        </Alert>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>ID</Th>
                <Th>Data</Th>
                <Th>Modelo</Th>
                <Th>Diagnóstico</Th>
                <Th>Resultado Esperado</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredAttendances?.map((attendance: Attendance) => (
                <Tr key={attendance.id}>
                  <Td>{attendance.id.substring(0, 8)}...</Td>
                  <Td>{formatDate(attendance.attendance_date)}</Td>
                  <Td>{getModelDisplayName(attendance.model_used)}</Td>
                  <Td>{attendance.model_result}</Td>
                  <Td>{attendance.expected_result}</Td>
                  <Td>
                    <Badge colorScheme={getBadgeColor(attendance.correct_diagnosis)}>
                      {attendance.correct_diagnosis ? 'Correto' : 'Incorreto'}
                    </Badge>
                  </Td>
                  <Td>
                    <IconButton
                      aria-label="View details"
                      icon={<FiEye />}
                      size="sm"
                      colorScheme="blue"
                      variant="ghost"
                      as={Link}
                      to={`/attendances/${attendance.id}`}
                    />
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}
    </Box>
  );
};

export default AttendancesPage;