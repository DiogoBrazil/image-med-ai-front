import * as React from 'react';
import { Box, Flex, Text, Link, Container } from '@chakra-ui/react';
import { FiGithub, FiHeart } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box as="footer" bg="white" py={4} borderTopWidth="1px" borderColor="gray.200" className="no-print">
      <Container maxW="container.xl">
        <Flex 
          direction={{ base: 'column', md: 'row' }} 
          justify="space-between" 
          align="center"
          fontSize="sm"
        >
          <Text color="gray.500">
            © {currentYear} ImageMedAi. Todos os direitos reservados.
          </Text>
          
          <Flex align="center" mt={{ base: 2, md: 0 }}>
            <Text color="gray.500" mr={2}>
              Desenvolvido com
            </Text>
            <FiHeart color="#0066ff" style={{ marginRight: '8px' }} />
            <Text color="gray.500">
              Para cuidar da sua saúde
            </Text>
          </Flex>
        </Flex>
      </Container>
    </Box>
  );
};

export default Footer;