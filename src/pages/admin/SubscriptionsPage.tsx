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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Spinner,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import * as Yup from 'yup';
import { Formik, Form, Field, FieldProps } from 'formik';
import api from '../../services/api';
import { Subscription } from '../../types';

const subscriptionSchema = Yup.object().shape({
  adminId: Yup.string().required('ID do administrador é obrigatório'),
  startDate: Yup.date().required('Data de início é obrigatória'),
  endDate: Yup.date()
    .required('Data de término é obrigatória')
    .min(
      Yup.ref('startDate'),
      'Data de término deve ser maior que a data de início'
    ),
});

const SubscriptionsPage: React.FC = () => {
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedSubscription, setSelectedSubscription] = useState<Subscription | null>(null);
  const queryClient = useQueryClient();

  // Get subscriptions from API
  const { data: subscriptions, isLoading, error } = useQuery(['subscriptions'], async () => {
    const response = await api.get('/api/subscriptions');
    return response.data.detail.subscriptions;
  });

  // Create subscription mutation
  const createSubscriptionMutation = useMutation(
    async (newSubscription: { admin_id: string; start_date: string; end_date: string }) => {
      return await api.post('/api/subscriptions', newSubscription);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['subscriptions']);
        toast({
          title: 'Assinatura criada',
          description: 'A assinatura foi criada com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        onClose();
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao criar assinatura',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao criar a assinatura',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Update subscription mutation
  const updateSubscriptionMutation = useMutation(
    async ({ id, data }: { id: string; data: { status: 'active' | 'inactive' } }) => {
      return await api.patch(`/api/subscriptions/${id}`, data);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['subscriptions']);
        toast({
          title: 'Assinatura atualizada',
          description: 'O status da assinatura foi atualizado com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar assinatura',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao atualizar a assinatura',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handleCreateSubscription = (values: any, { resetForm }: any) => {
    const newSubscription = {
      admin_id: values.adminId,
      start_date: values.startDate,
      end_date: values.endDate,
    };

    createSubscriptionMutation.mutate(newSubscription);
    resetForm();
  };

  const handleToggleStatus = (subscription: Subscription) => {
    const newStatus = subscription.status === 'active' ? 'inactive' : 'active';
    updateSubscriptionMutation.mutate({
      id: subscription.id,
      data: { status: newStatus },
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
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
      <Box py={8}>
        <Alert status="error">
          <AlertIcon />
          Erro ao carregar assinaturas. Por favor, tente novamente mais tarde.
        </Alert>
      </Box>
    );
  }

  return (
    <Box py={8}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Assinaturas</Heading>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="primary"
          onClick={onOpen}
        >
          Nova Assinatura
        </Button>
      </Flex>

      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>ID do Administrador</Th>
              <Th>Data de Início</Th>
              <Th>Data de Término</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </Tr>
          </Thead>
          <Tbody>
            {subscriptions?.map((subscription: Subscription) => (
              <Tr key={subscription.id}>
                <Td>{subscription.admin_id}</Td>
                <Td>{formatDate(subscription.start_date)}</Td>
                <Td>{formatDate(subscription.end_date)}</Td>
                <Td>
                  <Badge colorScheme={subscription.status === 'active' ? 'green' : 'red'}>
                    {subscription.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </Td>
                <Td>
                  <Button
                    size="sm"
                    colorScheme={subscription.status === 'active' ? 'red' : 'green'}
                    variant="outline"
                    onClick={() => handleToggleStatus(subscription)}
                  >
                    {subscription.status === 'active' ? 'Desativar' : 'Ativar'}
                  </Button>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Create Subscription Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Nova Assinatura</ModalHeader>
          <ModalCloseButton />
          <Formik
            initialValues={{
              adminId: '',
              startDate: '',
              endDate: '',
            }}
            validationSchema={subscriptionSchema}
            onSubmit={handleCreateSubscription}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <ModalBody pb={6}>
                  <Field name="adminId">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.adminId && form.touched.adminId)} mb={4}>
                        <FormLabel>ID do Administrador</FormLabel>
                        <Input {...field} placeholder="ID do administrador" />
                        <FormErrorMessage>{form.errors.adminId?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="startDate">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.startDate && form.touched.startDate)} mb={4}>
                        <FormLabel>Data de Início</FormLabel>
                        <Input {...field} type="date" />
                        <FormErrorMessage>{form.errors.startDate?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="endDate">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.endDate && form.touched.endDate)}>
                        <FormLabel>Data de Término</FormLabel>
                        <Input {...field} type="date" />
                        <FormErrorMessage>{form.errors.endDate?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>
                </ModalBody>

                <ModalFooter>
                  <Button
                    colorScheme="primary"
                    mr={3}
                    type="submit"
                    isLoading={isSubmitting}
                  >
                    Salvar
                  </Button>
                  <Button onClick={onClose}>Cancelar</Button>
                </ModalFooter>
              </Form>
            )}
          </Formik>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default SubscriptionsPage;