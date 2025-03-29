import * as React from 'react';
import { useState } from 'react';
import {
  Box,
  Button,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  IconButton,
  useToast,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  Input,
  InputGroup,
  InputLeftElement,
  Select
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import api from '../../services/api';
import { HealthUnit } from '../../types';

const HealthUnitsPage: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedHealthUnit, setSelectedHealthUnit] = useState<HealthUnit | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { authState } = useAuth();
  const cancelRef = React.useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  // Get the health units from the API
  const { data: healthUnitsData, isLoading, error } = useQuery(['healthUnits'], async () => {
    const response = await api.get('/api/health-units');
    return response.data.detail.health_units;
  });

  // Filter the health units based on the search term and status
  const filteredHealthUnits = healthUnitsData?.filter((unit: HealthUnit) => {
    const matchesSearch = unit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       unit.cnpj.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || unit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Delete health unit mutation
  const deleteHealthUnitMutation = useMutation(
    async (unitId: string) => {
      return await api.delete(`/api/health-units/${unitId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['healthUnits']);
        toast({
          title: 'Unidade excluída',
          description: 'A unidade de saúde foi excluída com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao excluir unidade',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao excluir a unidade de saúde',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handleDeleteClick = (unit: HealthUnit) => {
    setSelectedHealthUnit(unit);
    onOpen();
  };

  const confirmDelete = async () => {
    if (selectedHealthUnit) {
      try {
        await deleteHealthUnitMutation.mutateAsync(selectedHealthUnit.id);
      } catch (error) {
        console.error('Error deleting health unit:', error);
      }
    }
    onClose();
  };

  // Format CNPJ
  const formatCNPJ = (cnpj: string) => {
    if (!cnpj) return '';
    return cnpj.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5");
  };

  return (
    <Box py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Unidades de Saúde</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="primary"
          onClick={() => navigate('/health-units/new')}
        >
          Nova Unidade
        </Button>
      </Flex>

      <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup maxW={{ base: '100%', md: '70%' }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nome ou CNPJ"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW="200px"
        >
          <option value="all">Todos Status</option>
          <option value="active">Ativo</option>
          <option value="inactive">Inativo</option>
        </Select>
      </Flex>

      {isLoading ? (
        <Box>Carregando...</Box>
      ) : error ? (
        <Box>Erro ao carregar unidades de saúde</Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>CNPJ</Th>
                <Th>Status</Th>
                <Th>Criado em</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredHealthUnits?.map((unit: HealthUnit) => (
                <Tr key={unit.id}>
                  <Td>{unit.name}</Td>
                  <Td>{formatCNPJ(unit.cnpj)}</Td>
                  <Td>
                    <Badge colorScheme={unit.status === 'active' ? 'green' : 'red'}>
                      {unit.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>{new Date(unit.created_at).toLocaleDateString('pt-BR')}</Td>
                  <Td>
                    <Flex>
                      <IconButton
                        aria-label="Edit"
                        icon={<FiEdit2 />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        mr={2}
                        onClick={() => navigate(`/health-units/${unit.id}/edit`)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteClick(unit)}
                      />
                    </Flex>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Excluir Unidade de Saúde
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir a unidade {selectedHealthUnit?.name}? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteHealthUnitMutation.isLoading}
              >
                Excluir
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default HealthUnitsPage;