import * as React from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  VStack,
  Heading,
  useToast,
  Select,
  Card,
  CardBody,
  Flex,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { HealthUnit } from '../../types';

// Validation schema with CNPJ validation
const healthUnitSchema = Yup.object().shape({
  name: Yup.string().required('Nome é obrigatório'),
  cnpj: Yup.string()
    .required('CNPJ é obrigatório')
    .matches(
      /^[0-9]{14}$/,
      'CNPJ deve conter 14 dígitos numéricos'
    ),
  status: Yup.string().oneOf(['active', 'inactive'], 'Status inválido').required('Status é obrigatório'),
});

const HealthUnitFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  // Fetch health unit data if editing
  const { data: healthUnitData, isLoading: isLoadingHealthUnit, error: healthUnitError } = useQuery(
    ['healthUnit', id],
    async () => {
      if (isEditing && id) {
        const response = await api.get(`/api/health-units/${id}`);
        return response.data.detail.health_unit;
      }
      return null;
    },
    {
      enabled: isEditing,
    }
  );

  // Create health unit mutation
  const createHealthUnitMutation = useMutation(
    async (healthUnitData: any) => {
      return await api.post('/api/health-units', healthUnitData);
    },
    {
      onSuccess: () => {
        toast({
          title: 'Unidade de saúde criada',
          description: 'Unidade de saúde criada com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/health-units');
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao criar unidade de saúde',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao criar a unidade de saúde',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Update health unit mutation
  const updateHealthUnitMutation = useMutation(
    async ({ id, healthUnitData }: { id: string; healthUnitData: any }) => {
      return await api.put(`/api/health-units/${id}`, healthUnitData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['healthUnits']);
        queryClient.invalidateQueries(['healthUnit', id]);
        toast({
          title: 'Unidade de saúde atualizada',
          description: 'Unidade de saúde atualizada com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/health-units');
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar unidade de saúde',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao atualizar a unidade de saúde',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    const healthUnitData = {
      name: values.name,
      cnpj: values.cnpj,
      status: values.status,
      admin_id: authState.user?.adminId || authState.user?.id,
    };

    if (isEditing && id) {
      updateHealthUnitMutation.mutate({ id, healthUnitData });
    } else {
      createHealthUnitMutation.mutate(healthUnitData);
    }
  };

  // CNPJ formatting function
  const formatCNPJ = (value: string) => {
    // Remove non-numeric characters
    const numericCNPJ = value.replace(/\D/g, '');
    return numericCNPJ.substring(0, 14);
  };

  if (isEditing && isLoadingHealthUnit) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Box>
    );
  }

  if (isEditing && healthUnitError) {
    return (
      <Alert status="error" mb={6}>
        <AlertIcon />
        Erro ao carregar dados da unidade de saúde. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }

  const initialValues = {
    name: healthUnitData?.name || '',
    cnpj: healthUnitData?.cnpj || '',
    status: healthUnitData?.status || 'active',
  };

  return (
    <Box py={8}>
      <Heading mb={6}>{isEditing ? 'Editar Unidade de Saúde' : 'Nova Unidade de Saúde'}</Heading>

      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={healthUnitSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, values, setFieldValue }) => (
              <Form>
                <VStack spacing={4} align="flex-start">
                  <Field name="name">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.name && form.touched.name)}>
                        <FormLabel>Nome</FormLabel>
                        <Input {...field} id="name" placeholder="Nome da unidade de saúde" />
                        <FormErrorMessage>{form.errors.name?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="cnpj">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.cnpj && form.touched.cnpj)}>
                        <FormLabel>CNPJ</FormLabel>
                        <Input 
                          {...field} 
                          id="cnpj" 
                          placeholder="CNPJ (apenas números)" 
                          maxLength={14}
                          onChange={(e) => {
                            const formatted = formatCNPJ(e.target.value);
                            setFieldValue('cnpj', formatted);
                          }}
                        />
                        <FormErrorMessage>{form.errors.cnpj?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="status">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.status && form.touched.status)}>
                        <FormLabel>Status</FormLabel>
                        <Select {...field} id="status">
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </Select>
                        <FormErrorMessage>{form.errors.status?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Flex w="100%" justify="flex-end" mt={4}>
                    <Button
                      colorScheme="gray"
                      mr={3}
                      onClick={() => navigate('/health-units')}
                    >
                      Cancelar
                    </Button>
                    <Button
                      colorScheme="primary"
                      isLoading={isSubmitting}
                      type="submit"
                    >
                      {isEditing ? 'Atualizar' : 'Criar'}
                    </Button>
                  </Flex>
                </VStack>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </Box>
  );
};

export default HealthUnitFormPage;