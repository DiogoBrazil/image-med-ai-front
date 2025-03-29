import { useState } from 'react';
import { 
  Box, 
  Button, 
  Flex, 
  FormControl, 
  FormLabel, 
  Heading, 
  Input, 
  Stack, 
  Text, 
  Link as ChakraLink, 
  FormErrorMessage,
  InputGroup,
  InputRightElement,
  Icon,
  useToast,
  Image,
  Container
} from '@chakra-ui/react';
import { Link, Navigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { useAuth } from '../context/AuthContext';
import { ThreeDots } from 'react-loader-spinner';

// Validation schema
const LoginSchema = Yup.object().shape({
  email: Yup.string()
    .email('E-mail inválido')
    .required('E-mail é obrigatório'),
  password: Yup.string()
    .required('Senha é obrigatória')
});

const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, authState, isLoading } = useAuth();
  const toast = useToast();

  // If user is already authenticated, redirect to dashboard
  if (authState.isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      await login(values);
    } catch (error) {
      // Error is handled in the AuthContext
      console.error('Login error:', error);
    }
  };

  return (
    <Box
      minH="100vh"
      bg="gray.50"
    >
      <Container maxW="container.xl">
        <Flex
          minH={'100vh'}
          align={'center'}
          justify={'center'}
          direction={{ base: 'column', md: 'row' }}
          gap={10}
          p={4}
        >
          <Stack spacing={8} maxW={{ base: '100%', md: '400px' }} w="full">
            <Stack align="center" mb={4}>
              <Heading fontSize={'3xl'} textAlign="center" color="primary.700">
                Entrar na Plataforma
              </Heading>
              <Text fontSize={'md'} color={'gray.600'} textAlign="center">
                Faça login para acessar o sistema de diagnóstico médico ✌️
              </Text>
            </Stack>
            <Box
              rounded={'lg'}
              bg={'white'}
              boxShadow={'lg'}
              p={8}
            >
              <Formik
                initialValues={{ email: '', password: '' }}
                validationSchema={LoginSchema}
                onSubmit={handleSubmit}
              >
                {() => (
                  <Form>
                    <Stack spacing={4}>
                      <Field name="email">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.email && form.touched.email)}>
                            <FormLabel>E-mail</FormLabel>
                            <Input 
                              {...field} 
                              type="email" 
                              placeholder="seu-email@exemplo.com" 
                              autoComplete="email"
                            />
                            <FormErrorMessage>{form.errors.email?.toString()}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>

                      <Field name="password">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.password && form.touched.password)}>
                            <FormLabel>Senha</FormLabel>
                            <InputGroup>
                              <Input 
                                {...field} 
                                type={showPassword ? 'text' : 'password'} 
                                placeholder="********" 
                                autoComplete="current-password"
                              />
                              <InputRightElement width="4.5rem">
                                <Button
                                  h="1.75rem"
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => setShowPassword(!showPassword)}
                                >
                                  <Icon
                                    as={showPassword ? FiEyeOff : FiEye}
                                    color="gray.500"
                                  />
                                </Button>
                              </InputRightElement>
                            </InputGroup>
                            <FormErrorMessage>{form.errors.password?.toString()}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>

                      <Stack spacing={6}>
                        <Stack
                          direction={{ base: 'column', sm: 'row' }}
                          align={'start'}
                          justify={'space-between'}
                        >
                          <ChakraLink color={'primary.600'} href="#">
                            Esqueceu a senha?
                          </ChakraLink>
                        </Stack>
                        <Button
                          colorScheme={'primary'}
                          type="submit"
                          isLoading={isLoading}
                          spinner={<ThreeDots color="white" height={12} width={40} />}
                          loadingText="Entrando..."
                        >
                          Entrar
                        </Button>
                      </Stack>
                    </Stack>
                  </Form>
                )}
              </Formik>
            </Box>
            <Stack pt={6} textAlign="center">
              <Text align={'center'}>
                <Link to="/">
                  <ChakraLink color={'primary.600'}>
                    Voltar para a página inicial
                  </ChakraLink>
                </Link>
              </Text>
            </Stack>
          </Stack>

          <Box 
            display={{ base: 'none', md: 'block' }}
            w={{ md: '400px', lg: '500px' }}
          >
            <Image
              src="/src/assets/login-image.svg"
              alt="Login Illustration"
              fallbackSrc="https://via.placeholder.com/500x600?text=Medical+Login"
              borderRadius="lg"
              boxShadow="lg"
            />
          </Box>
        </Flex>
      </Container>
    </Box>
  );
};

export default LoginPage;