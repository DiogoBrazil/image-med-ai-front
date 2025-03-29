import * as React from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Flex, 
  Heading, 
  Text, 
  Image, 
  SimpleGrid, 
  Icon, 
  Stack,
  useColorModeValue,
  Link
} from '@chakra-ui/react';
import { FiActivity, FiBriefcase, FiCpu, FiShield } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Feature = ({ title, text, icon }: { title: string; text: string; icon: React.ReactElement }) => {
  return (
    <Stack align="center" textAlign="center">
      <Flex
        w={16}
        h={16}
        align={'center'}
        justify={'center'}
        rounded={'full'}
        bg={'primary.50'}
        mb={4}
      >
        {icon}
      </Flex>
      <Text fontWeight={600} fontSize="lg">{title}</Text>
      <Text color={'gray.600'}>{text}</Text>
    </Stack>
  );
};

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { authState } = useAuth();
  const bgGradient = useColorModeValue(
    'linear(to-r, primary.50, secondary.50)',
    'linear(to-r, gray.700, gray.900)'
  );

  // If user is already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (authState.isAuthenticated) {
      navigate('/dashboard');
    }
  }, [authState.isAuthenticated, navigate]);

  return (
    <Box>
      {/* Hero Section */}
      <Box 
        bgGradient={bgGradient}
        minH="90vh" 
        py={10}
      >
        <Container maxW="container.xl">
          <Flex 
            direction={{ base: 'column', lg: 'row' }} 
            align="center" 
            justify="space-between"
            pt={{ base: 16, lg: 32 }}
            pb={{ base: 16, lg: 32 }}
          >
            <Box maxW={{ base: '100%', lg: '50%' }} pr={{ lg: 10 }}>
              <Heading 
                as="h1" 
                size="2xl" 
                mb={6} 
                color="primary.700"
                lineHeight="1.2"
              >
                Diagnóstico Médico Assistido por Inteligência Artificial
              </Heading>
              <Text fontSize="xl" mb={10} color="gray.600">
                Nossa plataforma utiliza modelos avançados de IA para auxiliar profissionais de saúde na detecção precoce de doenças através de imagens médicas.
              </Text>
              <Flex 
                gap={4} 
                direction={{ base: 'column', sm: 'row' }}
              >
                <Button 
                  size="lg" 
                  colorScheme="primary" 
                  onClick={() => navigate('/login')}
                  px={8}
                >
                  Entrar na Plataforma
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  colorScheme="primary"
                >
                  Saiba Mais
                </Button>
              </Flex>
            </Box>
            <Box 
              maxW={{ base: '100%', lg: '50%' }} 
              mt={{ base: 12, lg: 0 }}
              display="flex"
              justifyContent="center"
            >
              <Image 
                src="/src/assets/hero-image.svg" 
                alt="Ilustração de diagnóstico médico" 
                maxH="450px"
                borderRadius="lg"
                boxShadow="lg"
              />
            </Box>
          </Flex>
        </Container>
      </Box>

      {/* Features Section */}
      <Box py={20}>
        <Container maxW="container.xl">
          <Heading textAlign="center" mb={16} color="primary.700">
            Nossa Solução
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={10}>
            <Feature
              icon={<Icon as={FiActivity} w={10} h={10} color="primary.500" />}
              title="Diagnóstico Preciso"
              text="Detecção de doenças respiratórias, tuberculose, osteoporose e câncer de mama com alta precisão."
            />
            <Feature
              icon={<Icon as={FiCpu} w={10} h={10} color="primary.500" />}
              title="IA Avançada"
              text="Modelos de inteligência artificial treinados com milhares de imagens médicas de alta qualidade."
            />
            <Feature
              icon={<Icon as={FiShield} w={10} h={10} color="primary.500" />}
              title="Segurança Total"
              text="Seus dados de pacientes são protegidos com os mais altos padrões de segurança e privacidade."
            />
            <Feature
              icon={<Icon as={FiBriefcase} w={10} h={10} color="primary.500" />}
              title="Gestão Completa"
              text="Gerencie unidades de saúde, profissionais e acompanhe estatísticas de diagnósticos."
            />
          </SimpleGrid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box bg="primary.600" py={16} color="white">
        <Container maxW="container.lg" textAlign="center">
          <Heading mb={6}>Comece a usar hoje mesmo</Heading>
          <Text fontSize="xl" mb={10} maxW="container.md" mx="auto">
            Junte-se a centenas de profissionais e unidades de saúde que já estão utilizando nossa plataforma para melhorar seus diagnósticos.
          </Text>
          <Button 
            size="lg" 
            bg="white" 
            color="primary.600" 
            _hover={{ bg: 'gray.100' }}
            onClick={() => navigate('/login')}
            px={8}
          >
            Entrar na Plataforma
          </Button>
        </Container>
      </Box>

      {/* Footer for Landing Page */}
      <Box bg="gray.50" py={10}>
        <Container maxW="container.xl">
          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={8}>
            <Box>
              <Heading size="md" mb={4} color="primary.700">MedDiagnosis</Heading>
              <Text color="gray.600">
                Plataforma de diagnóstico médico assistido por inteligência artificial.
              </Text>
            </Box>
            <Box>
              <Heading size="md" mb={4} color="primary.700">Links Rápidos</Heading>
              <Stack spacing={2}>
                <Link color="gray.600" _hover={{ color: 'primary.500' }}>Sobre Nós</Link>
                <Link color="gray.600" _hover={{ color: 'primary.500' }}>Como Funciona</Link>
                <Link color="gray.600" _hover={{ color: 'primary.500' }}>Planos e Preços</Link>
                <Link color="gray.600" _hover={{ color: 'primary.500' }}>Contato</Link>
              </Stack>
            </Box>
            <Box>
              <Heading size="md" mb={4} color="primary.700">Contato</Heading>
              <Text color="gray.600" mb={2}>contato@meddiagnosis.com</Text>
              <Text color="gray.600" mb={2}>(11) 1234-5678</Text>
            </Box>
          </SimpleGrid>
          <Flex 
            borderTopWidth={1} 
            borderColor="gray.200" 
            pt={6} 
            mt={8}
            direction={{ base: 'column', md: 'row' }}
            justify="space-between"
            align="center"
          >
            <Text color="gray.500" fontSize="sm">
              © {new Date().getFullYear()} MedDiagnosis. Todos os direitos reservados.
            </Text>
            <Stack direction="row" spacing={4} mt={{ base: 4, md: 0 }}>
              <Link color="gray.500" fontSize="sm" _hover={{ color: 'primary.500' }}>
                Termos de Uso
              </Link>
              <Link color="gray.500" fontSize="sm" _hover={{ color: 'primary.500' }}>
                Política de Privacidade
              </Link>
            </Stack>
          </Flex>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;