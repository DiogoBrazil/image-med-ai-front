import { useState, useRef, FC } from 'react';
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
import { User, UserProfile } from '../../types';

const UsersPage: FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [profileFilter, setProfileFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { authState } = useAuth();
  const cancelRef = useRef<HTMLButtonElement>(null);
  const queryClient = useQueryClient();

  // Get the users from the API
  const { data: usersData, isLoading, error } = useQuery<User[]>(['users'], async () => {
    try {
      // Add a small delay to ensure the request completes properly (workaround for timing issues)
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await api.get('/api/users');
      console.log('Raw API response:', response.data);
      
      // Correctly handle the expected API response structure
      if (response.data?.detail?.users && Array.isArray(response.data.detail.users)) {
        return response.data.detail.users;
      }
      
      console.error('API response missing expected structure. Expected: detail.users array');
      return [];
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  }, {
    // Add retry to handle potential API connection issues
    retry: 2,
    retryDelay: 1000,
    // Add staleTime to prevent too frequent refreshes
    staleTime: 30000
  });

  // Ensure usersData is treated as an array
  const usersArray = Array.isArray(usersData) ? usersData : [];
  
  // Log data for debugging
  console.log('UsersData type:', typeof usersData, usersData);
  
  // Filter the users based on the search term, profile and status
  const filteredUsers = usersArray.filter((user: User) => {
    try {
      const matchesSearch = 
        (user.full_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase());
      const matchesProfile = profileFilter === 'all' || user.profile === profileFilter;
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter;
      
      return matchesSearch && matchesProfile && matchesStatus;
    } catch (err) {
      console.error('Error filtering user:', user, err);
      return false;
    }
  });

  // Delete user mutation
  const deleteUserMutation = useMutation(
    async (userId: string) => {
      return await api.delete(`/api/users/${userId}`);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        toast({
          title: 'Usuário excluído',
          description: 'O usuário foi excluído com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao excluir usuário',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao excluir o usuário',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    onOpen();
  };

  const confirmDelete = async () => {
    if (selectedUser) {
      try {
        await deleteUserMutation.mutateAsync(selectedUser.id);
      } catch (error) {
        console.error('Error deleting user:', error);
      }
    }
    onClose();
  };

  const getProfileBadgeColor = (profile: UserProfile) => {
    switch (profile) {
      case 'general_administrator':
        return 'red';
      case 'administrator':
        return 'purple';
      case 'professional':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const getProfileLabel = (profile: UserProfile) => {
    switch (profile) {
      case 'general_administrator':
        return 'Admin Geral';
      case 'administrator':
        return 'Administrador';
      case 'professional':
        return 'Profissional';
      default:
        return profile;
    }
  };

  return (
    <Box py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Usuários</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="primary"
          onClick={() => navigate('/users/new')}
        >
          Novo Usuário
        </Button>
      </Flex>

      <Flex mb={6} direction={{ base: 'column', md: 'row' }} gap={4}>
        <InputGroup maxW={{ base: '100%', md: '60%' }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Buscar por nome ou email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <Flex gap={4}>
          <Select
            value={profileFilter}
            onChange={(e) => setProfileFilter(e.target.value)}
            maxW="200px"
          >
            <option value="all">Todos Perfis</option>
            <option value="general_administrator">Admin Geral</option>
            <option value="administrator">Administrador</option>
            <option value="professional">Profissional</option>
          </Select>

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
      </Flex>

      {isLoading ? (
        <Box p={4} textAlign="center">Carregando usuários...</Box>
      ) : error ? (
        <Box p={4} color="red.500" textAlign="center">
          Erro ao carregar usuários. Por favor, tente novamente mais tarde.
          {console.error('Error in UsersPage:', error)}
        </Box>
      ) : !filteredUsers || filteredUsers.length === 0 ? (
        <Box p={4} textAlign="center">
          Nenhum usuário encontrado. {!usersData ? 'Erro ao carregar dados da API.' : 'Tente ajustar os filtros.'}
        </Box>
      ) : (
        <Box overflowX="auto">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Nome</Th>
                <Th>Email</Th>
                <Th>Perfil</Th>
                <Th>Status</Th>
                <Th>Criado em</Th>
                <Th>Ações</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers?.map((user: User) => (
                <Tr key={user.id}>
                  <Td>{user.full_name}</Td>
                  <Td>{user.email}</Td>
                  <Td>
                    <Badge colorScheme={getProfileBadgeColor(user.profile)}>
                      {getProfileLabel(user.profile)}
                    </Badge>
                  </Td>
                  <Td>
                    <Badge colorScheme={user.status === 'active' ? 'green' : 'red'}>
                      {user.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </Td>
                  <Td>{new Date(user.created_at).toLocaleDateString('pt-BR')}</Td>
                  <Td>
                    <Flex>
                      <IconButton
                        aria-label="Edit"
                        icon={<FiEdit2 />}
                        size="sm"
                        colorScheme="blue"
                        variant="ghost"
                        mr={2}
                        onClick={() => navigate(`/users/${user.id}/edit`)}
                      />
                      <IconButton
                        aria-label="Delete"
                        icon={<FiTrash2 />}
                        size="sm"
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleDeleteClick(user)}
                        isDisabled={user.id === authState.user?.id} // Can't delete yourself
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
              Excluir Usuário
            </AlertDialogHeader>

            <AlertDialogBody>
              Tem certeza que deseja excluir o usuário {selectedUser?.full_name}? Esta ação não pode ser desfeita.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancelar
              </Button>
              <Button
                colorScheme="red"
                onClick={confirmDelete}
                ml={3}
                isLoading={deleteUserMutation.isLoading}
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

export default UsersPage;