import { useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  Badge,
  Grid,
  GridItem,
  Flex,
  Button,
  Image,
  Card,
  CardHeader,
  CardBody,
  Spinner,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  useColorModeValue
} from '@chakra-ui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import { FiArrowLeft, FiDownload } from 'react-icons/fi';
import api from '../../services/api';
import { Attendance, BoundingBox } from '../../types';

const AttendanceDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const imageRef = useRef<HTMLImageElement>(null);
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const cardBg = useColorModeValue('white', 'gray.700');

  // Fetch attendance details by ID
  const { data: attendance, isLoading, error } = useQuery(
    ['attendance', id],
    async () => {
      if (id) {
        const response = await api.get(`/api/attendances/${id}`);
        return response.data.detail.attendance;
      }
      return null;
    }
  );

  // Get display name for models
  const getModelDisplayName = (modelKey: string) => {
    const modelNames: Record<string, string> = {
      'respiratory': 'Respiratório',
      'tuberculosis': 'Tuberculose',
      'osteoporosis': 'Osteoporose',
      'breast': 'Câncer de Mama'
    };
    return modelNames[modelKey] || modelKey;
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Handle image download
  const handleDownloadImage = () => {
    if (attendance?.image_base64) {
      const link = document.createElement('a');
      link.href = `data:image/jpeg;base64,${attendance.image_base64}`;
      link.download = `attendance-${id}.jpg`;
      link.click();

      toast({
        title: 'Download iniciado',
        description: 'A imagem está sendo baixada',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const renderBoundingBoxes = () => {
    if (!attendance?.bounding_boxes || attendance.bounding_boxes.length === 0) {
      return null;
    }

    // Ensure the image is loaded before rendering boxes
    const imageElement = imageRef.current;
    if (!imageElement) return null;

    return attendance.bounding_boxes.map((box: BoundingBox, index: number) => {
      const style = {
        position: 'absolute' as 'absolute',
        left: `${box.x * 100}%`,
        top: `${box.y * 100}%`,
        width: `${box.width * 100}%`,
        height: `${box.height * 100}%`,
        border: '2px solid #FF0000',
        borderRadius: '4px',
      };

      return (
        <Box key={index} style={style}>
          <Badge bg="red.500" color="white" position="absolute" top="-20px" left="0">
            Confiança: {(box.confidence * 100).toFixed(1)}%
          </Badge>
        </Box>
      );
    });
  };

  if (isLoading) {
    return (
      <Box py={8} display="flex" justifyContent="center">
        <Spinner size="xl" color="primary.500" thickness="4px" />
      </Box>
    );
  }

  if (error || !attendance) {
    return (
      <Box py={8}>
        <Alert status="error" mb={6}>
          <AlertIcon />
          Erro ao carregar detalhes do atendimento. Por favor, tente novamente mais tarde.
        </Alert>
        <Button leftIcon={<FiArrowLeft />} onClick={() => navigate(-1)} mt={4}>
          Voltar
        </Button>
      </Box>
    );
  }

  return (
    <Box py={8}>
      <Flex alignItems="center" mb={6}>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="ghost"
          onClick={() => navigate('/attendances')}
          mr={4}
        >
          Voltar
        </Button>
        <Heading size="lg">Detalhes do Atendimento</Heading>
      </Flex>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Card borderWidth="1px" borderColor={borderColor} bg={cardBg} mb={6}>
            <CardHeader>
              <Heading size="md">Informações do Atendimento</Heading>
            </CardHeader>
            <Divider borderColor={borderColor} />
            <CardBody>
              <Grid templateColumns="1fr 2fr" gap={4}>
                <Text fontWeight="bold">ID:</Text>
                <Text>{attendance.id}</Text>

                <Text fontWeight="bold">Data:</Text>
                <Text>{formatDate(attendance.attendance_date)}</Text>

                <Text fontWeight="bold">Modelo Utilizado:</Text>
                <Text>{getModelDisplayName(attendance.model_used)}</Text>

                <Text fontWeight="bold">Resultado do Modelo:</Text>
                <Text>{attendance.model_result}</Text>

                <Text fontWeight="bold">Resultado Esperado:</Text>
                <Text>{attendance.expected_result}</Text>

                <Text fontWeight="bold">Diagnóstico:</Text>
                <Badge colorScheme={attendance.correct_diagnosis ? 'green' : 'red'} alignSelf="flex-start">
                  {attendance.correct_diagnosis ? 'Correto' : 'Incorreto'}
                </Badge>

                <Text fontWeight="bold">Observações:</Text>
                <Text>{attendance.observations || 'Nenhuma observação registrada'}</Text>
              </Grid>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card borderWidth="1px" borderColor={borderColor} bg={cardBg}>
            <CardHeader>
              <Flex justifyContent="space-between" alignItems="center">
                <Heading size="md">Imagem</Heading>
                <Button
                  leftIcon={<FiDownload />}
                  size="sm"
                  onClick={handleDownloadImage}
                  colorScheme="primary"
                  variant="outline"
                >
                  Download
                </Button>
              </Flex>
            </CardHeader>
            <Divider borderColor={borderColor} />
            <CardBody>
              <Box position="relative">
                <Image
                  ref={imageRef}
                  src={`data:image/jpeg;base64,${attendance.image_base64}`}
                  alt="Imagem do atendimento"
                  borderRadius="md"
                  w="100%"
                  onLoad={() => renderBoundingBoxes()}
                />
                {renderBoundingBoxes()}
              </Box>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </Box>
  );
};

export default AttendanceDetailsPage;