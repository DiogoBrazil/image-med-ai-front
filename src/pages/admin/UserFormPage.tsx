import { useEffect, useState } from 'react';
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
  Switch,
  FormHelperText,
} from '@chakra-ui/react';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';
import { User, UserProfile } from '../../types';

// Validation schema
const userSchema = Yup.object().shape({
  fullName: Yup.string().required('Nome completo é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  profile: Yup.string().oneOf(['administrator', 'professional'], 'Perfil inválido').required('Perfil é obrigatório'),
  password: Yup.string().when('isEditing', (isEditing, schema) => {
    return isEditing
      ? schema.min(6, 'Senha deve ter pelo menos 6 caracteres').nullable()
      : schema.min(6, 'Senha deve ter pelo menos 6 caracteres').required('Senha é obrigatória');
  }),
  confirmPassword: Yup.string().when(['password'], (password, schema) => {
    return password && password.length > 0
      ? schema.oneOf([Yup.ref('password')], 'As senhas não coincidem').required('Confirme sua senha')
      : schema.nullable();
  }),
  status: Yup.string().oneOf(['active', 'inactive'], 'Status inválido').required('Status é obrigatório'),
});

const UserFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const toast = useToast();
  const { authState } = useAuth();
  const queryClient = useQueryClient();

  // Fetch user data if editing
  const { data: userData, isLoading: isLoadingUser, error: userError } = useQuery(
    ['user', id],
    async () => {
      if (isEditing && id) {
        const response = await api.get(`/api/users/${id}`);
        return response.data.detail.user;
      }
      return null;
    },
    {
      enabled: isEditing,
    }
  );

  // Create user mutation
  const createUserMutation = useMutation(
    async (userData: any) => {
      return await api.post('/api/users', userData);
    },
    {
      onSuccess: () => {
        toast({
          title: 'Usuário criado',
          description: 'Usuário criado com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/users');
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao criar usuário',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao criar o usuário',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  // Update user mutation
  const updateUserMutation = useMutation(
    async ({ id, userData }: { id: string; userData: any }) => {
      return await api.put(`/api/users/${id}`, userData);
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['users']);
        queryClient.invalidateQueries(['user', id]);
        toast({
          title: 'Usuário atualizado',
          description: 'Usuário atualizado com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
        navigate('/users');
      },
      onError: (error: any) => {
        toast({
          title: 'Erro ao atualizar usuário',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao atualizar o usuário',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handleSubmit = (values: any, { setSubmitting }: any) => {
    const userData = {
      full_name: values.fullName,
      email: values.email,
      profile: values.profile,
      status: values.status,
    };

    if (values.password) {
      Object.assign(userData, { password: values.password });
    }

    if (isEditing && id) {
      updateUserMutation.mutate({ id, userData });
    } else {
      createUserMutation.mutate(userData);
    }
  };

  if (isEditing && isLoadingUser) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="400px">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Box>
    );
  }

  if (isEditing && userError) {
    return (
      <Alert status="error" mb={6}>
        <AlertIcon />
        Erro ao carregar dados do usuário. Por favor, tente novamente mais tarde.
      </Alert>
    );
  }

  const initialValues = {
    fullName: userData?.full_name || '',
    email: userData?.email || '',
    profile: userData?.profile || 'professional',
    password: '',
    confirmPassword: '',
    status: userData?.status || 'active',
    isEditing,
  };

  return (
    <Box py={8}>
      <Heading mb={6}>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</Heading>

      <Card>
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={userSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched, isSubmitting, values }) => (
              <Form>
                <VStack spacing={4} align="flex-start">
                  <Field name="fullName">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.fullName && form.touched.fullName)}>
                        <FormLabel>Nome Completo</FormLabel>
                        <Input {...field} id="fullName" placeholder="Nome completo" />
                        <FormErrorMessage>{form.errors.fullName?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="email">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.email && form.touched.email)}>
                        <FormLabel>Email</FormLabel>
                        <Input {...field} id="email" placeholder="Email" type="email" />
                        <FormErrorMessage>{form.errors.email?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="profile">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.profile && form.touched.profile)}>
                        <FormLabel>Perfil</FormLabel>
                        <Select {...field} id="profile">
                          {authState.user?.profile === 'general_administrator' && (
                            <option value="administrator">Administrador</option>
                          )}
                          <option value="professional">Profissional</option>
                        </Select>
                        <FormErrorMessage>{form.errors.profile?.toString()}</FormErrorMessage>
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

                  <Field name="password">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.password && form.touched.password)}>
                        <FormLabel>{isEditing ? 'Nova Senha (opcional)' : 'Senha'}</FormLabel>
                        <Input
                          {...field}
                          id="password"
                          placeholder={isEditing ? 'Nova senha' : 'Senha'}
                          type="password"
                        />
                        {isEditing && (
                          <FormHelperText>Deixe em branco para manter a senha atual</FormHelperText>
                        )}
                        <FormErrorMessage>{form.errors.password?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Field name="confirmPassword">
                    {({ field, form }: FieldProps) => (
                      <FormControl
                        isInvalid={!!(form.errors.confirmPassword && form.touched.confirmPassword)}
                      >
                        <FormLabel>Confirmar Senha</FormLabel>
                        <Input
                          {...field}
                          id="confirmPassword"
                          placeholder="Confirmar senha"
                          type="password"
                        />
                        <FormErrorMessage>{form.errors.confirmPassword?.toString()}</FormErrorMessage>
                      </FormControl>
                    )}
                  </Field>

                  <Flex w="100%" justify="flex-end" mt={4}>
                    <Button
                      colorScheme="gray"
                      mr={3}
                      onClick={() => navigate('/users')}
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

export default UserFormPage;