import * as React from 'react';
import { 
  Box, 
  Flex, 
  IconButton, 
  Avatar, 
  Menu, 
  MenuButton, 
  MenuList, 
  MenuItem, 
  Text, 
  useColorMode,
  Button,
  Badge,
  HStack,
  Divider
} from '@chakra-ui/react';
import { FiMenu, FiUser, FiSettings, FiLogOut, FiSun, FiMoon } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar, isSidebarOpen }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  const { authState, logout } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

  const getUserInitials = () => {
    if (!authState.user?.name) return 'U';
    const parts = authState.user.name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getProfileBadgeColor = () => {
    const profile = authState.user?.profile;
    switch (profile) {
      case 'general_administrator':
        return 'red';
      case 'administrator':
        return 'purple';
      case 'professional':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getProfileDisplayName = () => {
    const profile = authState.user?.profile;
    switch (profile) {
      case 'general_administrator':
        return 'Admin Geral';
      case 'administrator':
        return 'Administrador';
      case 'professional':
        return 'Profissional';
      default:
        return 'Usuário';
    }
  };

  return (
    <Box 
      as="header" 
      bg="white" 
      boxShadow="sm" 
      position="sticky" 
      top="0" 
      zIndex="1000"
    >
      <Flex 
        justify="space-between" 
        align="center" 
        h="64px" 
        px={4}
      >
        <Flex align="center">
          <IconButton
            aria-label="Toggle sidebar"
            icon={<FiMenu />}
            variant="ghost"
            onClick={toggleSidebar}
            mr={4}
          />
          <Text 
            fontWeight="bold" 
            fontSize="xl" 
            color="primary.600"
            cursor="pointer"
            onClick={() => navigate('/dashboard')}
          >
            MedDiagnosis
          </Text>
        </Flex>

        <HStack spacing={4}>
          <IconButton
            aria-label="Toggle color mode"
            icon={colorMode === 'light' ? <FiMoon /> : <FiSun />}
            variant="ghost"
            onClick={toggleColorMode}
          />

          {authState.isAuthenticated && authState.user && (
            <Menu>
              <MenuButton 
                as={Button} 
                rightIcon={<FiUser />} 
                variant="ghost"
                display="flex"
                alignItems="center"
              >
                <Flex align="center">
                  <Avatar 
                    size="sm" 
                    name={authState.user.name} 
                    bg="primary.500" 
                    color="white" 
                    mr={2}
                    fontWeight="bold"
                  >
                    {getUserInitials()}
                  </Avatar>
                  <Box display={{ base: 'none', md: 'block' }}>
                    <Text fontWeight="medium" fontSize="sm" textAlign="left">
                      {authState.user.name}
                    </Text>
                    <Badge 
                      colorScheme={getProfileBadgeColor()} 
                      fontSize="0.6em"
                    >
                      {getProfileDisplayName()}
                    </Badge>
                  </Box>
                </Flex>
              </MenuButton>
              <MenuList>
                <Text px={3} py={1} fontSize="sm" color="gray.500">
                  {authState.user.email}
                </Text>
                <Divider my={1} />
                <MenuItem icon={<FiUser />} onClick={handleProfileClick}>
                  Meu Perfil
                </MenuItem>
                <MenuItem icon={<FiSettings />} onClick={() => navigate('/profile')}>
                  Configurações
                </MenuItem>
                <Divider />
                <MenuItem icon={<FiLogOut />} onClick={logout}>
                  Sair
                </MenuItem>
              </MenuList>
            </Menu>
          )}
        </HStack>
      </Flex>
    </Box>
  );
};

export default Header;