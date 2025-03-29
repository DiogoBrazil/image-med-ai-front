import * as React from 'react';
import { Box, Button, Heading, Text, VStack, Container, useColorModeValue } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.800');

  return (
    <Box minH="100vh" bg={bgColor} py={10} display="flex" alignItems="center">
      <Container maxW="container.md">
        <VStack spacing={8} textAlign="center">
          <Heading as="h1" size="4xl" color="primary.500">
            404
          </Heading>
          <Heading as="h2" size="xl" color="gray.700">
            Página não encontrada
          </Heading>
          <Text fontSize="xl" color="gray.600">
            A página que você está procurando não existe ou foi movida.
          </Text>
          <Button 
            colorScheme="primary" 
            size="lg" 
            onClick={() => navigate('/')}
          >
            Voltar para a página inicial
          </Button>
        </VStack>
      </Container>
    </Box>
  );
};

export default NotFoundPage;