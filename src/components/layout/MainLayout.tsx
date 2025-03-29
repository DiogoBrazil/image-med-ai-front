import * as React from 'react';
import { ReactNode, useState } from 'react';
import { Box, Flex, useDisclosure, useMediaQuery } from '@chakra-ui/react';
import Sidebar from './SideBar';
import Header from './Header';
import Footer from './Footer';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isMobile] = useMediaQuery("(max-width: 768px)");
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => {
    if (isMobile) {
      isOpen ? onClose() : onOpen();
    } else {
      setCollapsed(!collapsed);
    }
  };

  return (
    <Flex direction="column" minHeight="100vh">
      <Header 
        toggleSidebar={toggleSidebar} 
        isSidebarOpen={isOpen || !collapsed} 
      />
      <Flex flex="1">
        <Sidebar 
          isOpen={isOpen} 
          onClose={onClose} 
          collapsed={collapsed} 
          isMobile={isMobile} 
        />
        <Box 
          as="main" 
          flex="1" 
          p={4} 
          bg="gray.50" 
          ml={isMobile ? 0 : (collapsed ? '80px' : '250px')}
          transition="margin-left 0.3s ease"
        >
          {children}
        </Box>
      </Flex>
      <Footer />
    </Flex>
  );
};

export default MainLayout;