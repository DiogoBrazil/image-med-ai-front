import { useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Stack,
  useToast,
  Flex,
  Avatar,
  Text,
  Divider,
  useColorModeValue
} from '@chakra-ui/react';
import { useAuth } from '../context/AuthContext';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';

const ProfileSchema = Yup.object().shape({
  fullName: Yup.string().required('Nome completo é obrigatório'),
  email: Yup.string().email('Email inválido').required('Email é obrigatório'),
  currentPassword: Yup.string().min(6, 'Senha atual deve ter pelo menos 6 caracteres'),
  newPassword: Yup.string().min(6, 'Nova senha deve ter pelo menos 6 caracteres'),
  confirmPassword: Yup.string().oneOf([Yup.ref('newPassword')], 'As senhas não coincidem')
});

const ProfilePage: React.FC = () => {
  const { authState } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const toast = useToast();
  const bgColor = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');

  const initialValues = {
    fullName: authState.user?.name || '',
    email: authState.user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  const handleSubmit = async (values: typeof initialValues, { resetForm }: any) => {
    try {
      // In a real app, you would call an API to update the profile
      console.log('Profile update values:', values);
      
      toast({
        title: 'Perfil atualizado',
        description: 'Suas informações foram atualizadas com sucesso',
        status: 'success',
        duration: 5000,
        isClosable: true
      });
      
      setIsEditing(false);
      resetForm({ values: { ...values, currentPassword: '', newPassword: '', confirmPassword: '' } });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar perfil',
        description: 'Não foi possível atualizar suas informações',
        status: 'error',
        duration: 5000,
        isClosable: true
      });
    }
  };

  return (
    <Box py={8}>
      <Heading mb={6}>Meu Perfil</Heading>
      
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} boxShadow="md" mb={6}>
        <CardHeader>
          <Flex align="center">
            <Avatar 
              size="xl" 
              name={authState.user?.name} 
              src=""
              bg="primary.500"
              color="white"
              mr={6}
            />
            <Box>
              <Heading size="md">{authState.user?.name}</Heading>
              <Text color="gray.600">{authState.user?.email}</Text>
              <Text color="primary.500" fontWeight="bold" mt={1}>
                {authState.user?.profile === 'general_administrator' ? 'Administrador Geral' : 
                 authState.user?.profile === 'administrator' ? 'Administrador' : 'Profissional'}
              </Text>
            </Box>
          </Flex>
        </CardHeader>
      </Card>
      
      <Card bg={bgColor} borderWidth="1px" borderColor={borderColor} boxShadow="md">
        <CardHeader>
          <Heading size="md">Informações do Usuário</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <Formik
            initialValues={initialValues}
            validationSchema={ProfileSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched, isSubmitting }) => (
              <Form>
                <Stack spacing={4}>
                  <Field name="fullName">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.fullName && form.touched.fullName)}>
                        <FormLabel>Nome completo</FormLabel>
                        <Input
                          {...field}
                          isReadOnly={!isEditing}
                          focusBorderColor="primary.500"
                        />
                      </FormControl>
                    )}
                  </Field>

                  <Field name="email">
                    {({ field, form }: FieldProps) => (
                      <FormControl isInvalid={!!(form.errors.email && form.touched.email)}>
                        <FormLabel>Email</FormLabel>
                        <Input
                          {...field}
                          type="email"
                          isReadOnly={!isEditing}
                          focusBorderColor="primary.500"
                        />
                      </FormControl>
                    )}
                  </Field>

                  {isEditing && (
                    <>
                      <Divider my={4} />
                      <Heading size="sm" mb={2}>Alterar Senha</Heading>

                      <Field name="currentPassword">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.currentPassword && form.touched.currentPassword)}>
                            <FormLabel>Senha atual</FormLabel>
                            <Input
                              {...field}
                              type="password"
                              focusBorderColor="primary.500"
                            />
                          </FormControl>
                        )}
                      </Field>

                      <Field name="newPassword">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.newPassword && form.touched.newPassword)}>
                            <FormLabel>Nova senha</FormLabel>
                            <Input
                              {...field}
                              type="password"
                              focusBorderColor="primary.500"
                            />
                          </FormControl>
                        )}
                      </Field>

                      <Field name="confirmPassword">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.confirmPassword && form.touched.confirmPassword)}>
                            <FormLabel>Confirmar nova senha</FormLabel>
                            <Input
                              {...field}
                              type="password"
                              focusBorderColor="primary.500"
                            />
                          </FormControl>
                        )}
                      </Field>
                    </>
                  )}

                  <Flex justifyContent="flex-end" mt={4}>
                    {isEditing ? (
                      <>
                        <Button 
                          variant="outline" 
                          mr={3} 
                          onClick={() => setIsEditing(false)}
                        >
                          Cancelar
                        </Button>
                        <Button 
                          colorScheme="primary" 
                          type="submit" 
                          isLoading={isSubmitting}
                        >
                          Salvar
                        </Button>
                      </>
                    ) : (
                      <Button 
                        colorScheme="primary" 
                        onClick={() => setIsEditing(true)}
                      >
                        Editar Perfil
                      </Button>
                    )}
                  </Flex>
                </Stack>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
    </Box>
  );
};

export default ProfilePage;