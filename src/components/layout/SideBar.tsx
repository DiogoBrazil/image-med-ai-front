import { useMemo } from 'react';
import { 
  Box, 
  Flex, 
  VStack, 
  Text, 
  Icon, 
  Drawer, 
  DrawerOverlay, 
  DrawerContent, 
  DrawerBody, 
  DrawerCloseButton,
  Divider,
  Tooltip
} from '@chakra-ui/react';
import { Link, useLocation } from 'react-router-dom';
import { 
  FiHome, 
  FiUsers, 
  FiActivity, 
  FiBarChart2, 
  FiFileText, 
  FiPlus, 
  FiMap, 
  FiCreditCard, 
  FiFolder
} from 'react-icons/fi';
import { FaHospital, FaBrain } from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { UserProfile } from '../../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  collapsed: boolean;
  isMobile: boolean;
}

interface NavItem {
  label: string;
  icon: any;
  to: string;
  allowedProfiles: UserProfile[];
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, collapsed, isMobile }) => {
  const { authState } = useAuth();
  const location = useLocation();
  
  const navItems: NavItem[] = useMemo(() => [
    { 
      label: 'Dashboard', 
      icon: FiHome, 
      to: '/dashboard',
      allowedProfiles: ['general_administrator', 'administrator', 'professional'] 
    },
    { 
      label: 'Usuários', 
      icon: FiUsers, 
      to: '/users',
      allowedProfiles: ['general_administrator', 'administrator'] 
    },
    { 
      label: 'Unidades de Saúde', 
      icon: FaHospital, 
      to: '/health-units',
      allowedProfiles: ['general_administrator', 'administrator'] 
    },
    { 
      label: 'Predições', 
      icon: FaBrain, 
      to: '/predictions',
      allowedProfiles: ['professional'] 
    },
    { 
      label: 'Novo Atendimento', 
      icon: FiPlus, 
      to: '/attendances/new',
      allowedProfiles: ['professional'] 
    },
    { 
      label: 'Atendimentos', 
      icon: FiFileText, 
      to: '/attendances',
      allowedProfiles: ['general_administrator', 'administrator', 'professional'] 
    },
    { 
      label: 'Estatísticas', 
      icon: FiBarChart2, 
      to: '/statistics',
      allowedProfiles: ['general_administrator', 'administrator'] 
    },
    { 
      label: 'Assinaturas', 
      icon: FiCreditCard, 
      to: '/subscriptions',
      allowedProfiles: ['general_administrator'] 
    },
  ], []);

  const filteredNavItems = useMemo(() => {
    if (!authState.user) return [];
    
    return navItems.filter(item => 
      item.allowedProfiles.includes(authState.user?.profile as UserProfile)
    );
  }, [authState.user, navItems]);

  const renderNavItems = () => {
    return filteredNavItems.map((item) => {
      const isActive = location.pathname === item.to;
      
      return (
        <Tooltip
          key={item.to}
          label={item.label}
          placement="right"
          isDisabled={!collapsed || isMobile}
        >
          <Link to={item.to} onClick={isMobile ? onClose : undefined}>
            <Flex
              align="center"
              p={3}
              borderRadius="md"
              bg={isActive ? 'primary.50' : 'transparent'}
              color={isActive ? 'primary.700' : 'gray.600'}
              _hover={{ bg: isActive ? 'primary.50' : 'gray.100' }}
              transition="all 0.2s"
            >
              <Icon as={item.icon} fontSize="xl" />
              <Text 
                ml={4} 
                fontWeight={isActive ? 'medium' : 'normal'}
                opacity={collapsed && !isMobile ? 0 : 1}
                width={collapsed && !isMobile ? 0 : 'auto'}
                overflow="hidden"
                transition="all 0.2s"
              >
                {item.label}
              </Text>
            </Flex>
          </Link>
        </Tooltip>
      );
    });
  };

  // Content to render inside both the drawer and the sidebar
  const content = (
    <VStack align="stretch" spacing={1} mt={2}>
      {renderNavItems()}
    </VStack>
  );

  // For mobile: render a drawer
  if (isMobile) {
    return (
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerBody p={0} mt={10}>
            {content}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // For desktop: render a persistent sidebar
  return (
    <Box 
      as="nav"
      position="fixed"
      h="calc(100vh - 64px)"
      bg="white"
      w={collapsed ? '80px' : '250px'}
      transition="width 0.3s ease"
      boxShadow="sm"
      zIndex={900}
      overflowX="hidden"
      top="64px"
    >
      {content}
    </Box>
  );
};

export default Sidebar;