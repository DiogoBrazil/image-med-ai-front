import { useState, useEffect, FC } from 'react';
import { 
  Box, 
  Heading, 
  Text, 
  Button, 
  FormControl, 
  FormLabel, 
  Input, 
  Select, 
  Textarea, 
  VStack, 
  useToast, 
  Flex, 
  Grid, 
  GridItem,
  Card,
  CardHeader,
  CardBody,
  Switch,
  FormHelperText,
  RadioGroup,
  Radio,
  HStack,
  Image,
  Alert,
  AlertIcon,
  Spinner,
  Progress,
  Badge,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  CloseButton,
  FormErrorMessage,
  Icon
} from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from 'react-query';
import { useDropzone } from 'react-dropzone';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ApiResponse, HealthUnit } from '../../types';
import { Formik, Form, Field, FieldProps } from 'formik';
import * as Yup from 'yup';
import { FiUpload, FiFile, FiX, FiInfo } from 'react-icons/fi';

// Validation schema
const AttendanceSchema = Yup.object().shape({
  health_unit_id: Yup.string().required('Unidade de saúde é obrigatória'),
  model_used: Yup.string().required('Tipo de modelo é obrigatório'),
  model_result: Yup.string().required('Resultado do modelo é obrigatório'),
  expected_result: Yup.string(),
  correct_diagnosis: Yup.boolean(),
  observations: Yup.string()
});

const NewAttendancePage: FC = () => {
  const toast = useToast();
  const navigate = useNavigate();
  const { authState } = useAuth();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [predictionData, setPredictionData] = useState<any | null>(null);
  const [boundingBoxes, setBoundingBoxes] = useState<any[]>([]);
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Fetch health units
  const healthUnitsQuery = useQuery(
    'health-units',
    async () => {
      const response = await api.get<ApiResponse<{ health_units: HealthUnit[], count: number }>>('/api/health-units');
      return response.data.detail.health_units;
    },
    {
      enabled: !!authState.isAuthenticated,
      staleTime: 5 * 60 * 1000,
    }
  );

  // Dropzone configuration
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.tiff', '.dicom', '.dcm']
    },
    maxFiles: 1,
    onDrop: (acceptedFiles) => {
      if (acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        setPreviewUrl(URL.createObjectURL(file));
        
        // Convert image to base64
        const reader = new FileReader();
        reader.onload = () => {
          const base64Data = reader.result as string;
          // Extract the base64 part (remove prefix)
          const base64Content = base64Data.split(',')[1];
          setImageBase64(base64Content);
        };
        reader.readAsDataURL(file);
      }
    }
  });

  // Create attendance mutation
  const createAttendance = useMutation(
    async (data: any) => {
      const response = await api.post('/api/attendances/', data);
      return response.data;
    },
    {
      onSuccess: (data) => {
        toast({
          title: 'Atendimento registrado',
          description: 'O atendimento foi registrado com sucesso!',
          status: 'success',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        
        navigate(`/attendances/${data.detail.attendance_id}`);
      },
      onError: (error: any) => {
        const errorMessage = error.response?.data?.detail?.message || 
                             'Erro ao registrar atendimento. Por favor, tente novamente.';
        
        toast({
          title: 'Erro ao registrar atendimento',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
          position: 'top-right'
        });
        
        console.error('Registration error:', error);
      }
    }
  );

  // Check if there is prediction data in localStorage
  useEffect(() => {
    const storedPrediction = localStorage.getItem('predictionResult');
    if (storedPrediction) {
      try {
        const data = JSON.parse(storedPrediction);
        setPredictionData(data);
        
        // Set the image from the prediction data if it exists
        if (data.result && data.result.image_base64) {
          setImageBase64(data.result.image_base64);
          setPreviewUrl(`data:image/jpeg;base64,${data.result.image_base64}`);
        }
        
        // Set bounding boxes if it's a breast cancer prediction
        if (data.model === 'breast' && data.result.bounding_boxes) {
          setBoundingBoxes(data.result.bounding_boxes);
        }
        
        // Clear the localStorage
        localStorage.removeItem('predictionResult');
      } catch (error) {
        console.error('Error parsing prediction data:', error);
      }
    }
  }, []);

  // Function to view prediction details
  const handleViewPrediction = () => {
    onOpen();
  };

  const getInitialValues = () => {
    let model_result = '';
    let model_used = '';
    
    if (predictionData) {
      model_used = predictionData.model;
      
      if (model_used === 'respiratory') {
        const sorted = Object.entries(predictionData.result.prediction)
          .sort(([, valueA], [, valueB]) => (valueB as number) - (valueA as number));
        if (sorted.length > 0) {
          model_result = `${sorted[0][0]} (${(sorted[0][1] as number).toFixed(2)}%)`;
        }
      } else if (model_used === 'tuberculosis') {
        model_result = predictionData.result.prediction.class_pred;
      } else if (model_used === 'osteoporosis') {
        model_result = predictionData.result.prediction.class_pred;
      } else if (model_used === 'breast') {
        const count = predictionData.result.detections.length;
        model_result = `${count} ${count === 1 ? 'área suspeita' : 'áreas suspeitas'} detectada${count !== 1 ? 's' : ''}`;
      }
    }
    
    return {
      health_unit_id: '',
      model_used: model_used || '',
      model_result: model_result || '',
      expected_result: '',
      correct_diagnosis: false,
      observations: ''
    };
  };

  // Handle form submission
  const handleSubmit = (values: any) => {
    if (!imageBase64) {
      toast({
        title: 'Imagem obrigatória',
        description: 'É necessário carregar uma imagem para o atendimento.',
        status: 'warning',
        duration: 5000,
        isClosable: true,
        position: 'top-right'
      });
      return;
    }
    
    type AttendanceData = {
      professional_id: string;
      health_unit_id: string;
      admin_id: string;
      model_used: string;
      model_result: string;
      expected_result: string;
      correct_diagnosis: boolean;
      image_base64: string;
      observation: string;
      bounding_boxes?: any[];
    };
    
    const attendanceData: AttendanceData = {
      professional_id: authState.user?.id || '',
      health_unit_id: values.health_unit_id,
      admin_id: authState.user?.adminId || '',
      model_used: values.model_used,
      model_result: values.model_result,
      expected_result: values.expected_result,
      correct_diagnosis: values.correct_diagnosis,
      image_base64: imageBase64,
      observation: values.observations
    };
    
    // Add bounding boxes if it's a breast cancer prediction
    if (values.model_used === 'breast' && boundingBoxes.length > 0) {
      attendanceData.bounding_boxes = boundingBoxes;
    }
    
    createAttendance.mutate(attendanceData);
  };

  // Loading states
  if (healthUnitsQuery.isLoading) {
    return (
      <Flex justify="center" align="center" minH="300px" direction="column">
        <Spinner size="xl" color="primary.500" mb={4} />
        <Text>Carregando unidades de saúde...</Text>
      </Flex>
    );
  }

  // Error states
  if (healthUnitsQuery.isError) {
    return (
      <Alert status="error" borderRadius="md">
        <AlertIcon />
        <Box>
          <Text fontWeight="bold">Erro ao carregar unidades de saúde</Text>
          <Text>Por favor, tente novamente mais tarde.</Text>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <Heading mb={6} color="primary.700">Novo Atendimento</Heading>
      
      <Card variant="outline">
        <CardHeader bg="gray.50" py={3}>
          <Heading size="md">Dados do Atendimento</Heading>
        </CardHeader>
        
        <CardBody>
          <Formik
            initialValues={getInitialValues()}
            validationSchema={AttendanceSchema}
            onSubmit={handleSubmit}
          >
            {(formikProps) => (
              <Form>
                <Grid templateColumns={{ base: "1fr", lg: "1fr 1fr" }} gap={6}>
                  {/* Left Column */}
                  <GridItem>
                    <VStack spacing={4} align="stretch">
                      <Field name="health_unit_id">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.health_unit_id && form.touched.health_unit_id)}>
                            <FormLabel>Unidade de Saúde</FormLabel>
                            <Select 
                              {...field} 
                              placeholder="Selecione uma unidade"
                            >
                              {healthUnitsQuery.data?.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                  {unit.name}
                                </option>
                              ))}
                            </Select>
                            <FormErrorMessage>{form.errors.health_unit_id as string}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Field name="model_used">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.model_used && form.touched.model_used)}>
                            <FormLabel>Modelo Utilizado</FormLabel>
                            <Select 
                              {...field} 
                              placeholder="Selecione o modelo"
                              isDisabled={!!predictionData}
                            >
                              <option value="respiratory">Doenças Respiratórias</option>
                              <option value="tuberculosis">Tuberculose</option>
                              <option value="osteoporosis">Osteoporose</option>
                              <option value="breast">Câncer de Mama</option>
                            </Select>
                            <FormErrorMessage>{form.errors.model_used as string}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Field name="model_result">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.model_result && form.touched.model_result)}>
                            <FormLabel>Resultado do Modelo</FormLabel>
                            <Flex>
                              <Input 
                                {...field} 
                                placeholder="Resultado da predição"
                                isDisabled={!!predictionData}
                                flexGrow={1}
                                mr={2}
                              />
                              {predictionData && (
                                <Button 
                                  colorScheme="primary" 
                                  variant="outline" 
                                  onClick={handleViewPrediction}
                                >
                                  Ver Detalhes
                                </Button>
                              )}
                            </Flex>
                            <FormHelperText>
                              {predictionData 
                                ? 'Resultado da predição realizada anteriormente' 
                                : 'Informe o resultado obtido pela análise do modelo'}
                            </FormHelperText>
                            <FormErrorMessage>{form.errors.model_result as string}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Field name="expected_result">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.expected_result && form.touched.expected_result)}>
                            <FormLabel>Resultado Esperado</FormLabel>
                            <Input 
                              {...field} 
                              placeholder="Resultado esperado ou diagnóstico confirmado"
                            />
                            <FormHelperText>
                              Preencha se já tiver um diagnóstico confirmado
                            </FormHelperText>
                            <FormErrorMessage>{form.errors.expected_result as string}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Field name="correct_diagnosis">
                        {({ field, form }: FieldProps) => (
                          <FormControl 
                            display="flex" 
                            alignItems="center" 
                            isInvalid={!!(form.errors.correct_diagnosis && form.touched.correct_diagnosis)}
                          >
                            <FormLabel mb="0">
                              Diagnóstico correto?
                            </FormLabel>
                            <Switch 
                              {...field} 
                              isChecked={field.value}
                              colorScheme="green"
                            />
                            <FormErrorMessage>{form.errors.correct_diagnosis as string}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                      
                      <Field name="observations">
                        {({ field, form }: FieldProps) => (
                          <FormControl isInvalid={!!(form.errors.observations && form.touched.observations)}>
                            <FormLabel>Observações</FormLabel>
                            <Textarea 
                              {...field} 
                              placeholder="Observações adicionais sobre o diagnóstico"
                              rows={4}
                            />
                            <FormErrorMessage>{form.errors.observations as string}</FormErrorMessage>
                          </FormControl>
                        )}
                      </Field>
                    </VStack>
                  </GridItem>
                  
                  {/* Right Column */}
                  <GridItem>
                    <VStack spacing={4} align="stretch">
                      <Heading size="sm">Imagem Médica</Heading>
                      
                      {!imageBase64 ? (
                        <Box
                          {...getRootProps()}
                          className={`image-dropzone ${isDragActive ? 'active' : ''}`}
                          height="300px"
                          display="flex"
                          flexDirection="column"
                          justifyContent="center"
                          alignItems="center"
                          borderWidth={2}
                          borderStyle="dashed"
                          borderColor={isDragActive ? "primary.500" : "gray.300"}
                          borderRadius="md"
                          p={4}
                          transition="all 0.3s ease"
                          bg={isDragActive ? "primary.50" : "transparent"}
                          _hover={{
                            borderColor: "primary.400",
                            bg: "primary.50"
                          }}
                        >
                          <input {...getInputProps()} />
                          <Icon as={FiUpload} fontSize="3xl" color="gray.400" mb={4} />
                          <Text textAlign="center" color="gray.500">
                            {isDragActive
                              ? 'Solte a imagem aqui'
                              : 'Arraste e solte uma imagem médica aqui, ou clique para selecionar'}
                          </Text>
                          <Text fontSize="xs" color="gray.400" mt={2}>
                            Formatos aceitos: JPEG, PNG, DICOM
                          </Text>
                        </Box>
                      ) : (
                        <Box position="relative" borderRadius="md" overflow="hidden" borderWidth={1} borderColor="gray.200">
                          <Image
                            src={previewUrl || ''}
                            alt="Imagem médica"
                            maxH="300px"
                            mx="auto"
                            objectFit="contain"
                          />
                          <Button
                            position="absolute"
                            top={2}
                            right={2}
                            size="sm"
                            colorScheme="red"
                            onClick={() => {
                              setImageBase64(null);
                              setPreviewUrl(null);
                            }}
                          >
                            <Icon as={FiX} />
                          </Button>
                        </Box>
                      )}
                      
                      <Alert status="info" borderRadius="md">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold">Imagem para Diagnóstico</Text>
                          <Text fontSize="sm">
                            A imagem será anexada ao atendimento e poderá ser visualizada posteriormente.
                          </Text>
                        </Box>
                      </Alert>
                      
                      {predictionData && predictionData.model === 'breast' && boundingBoxes.length > 0 && (
                        <Alert status="warning" borderRadius="md">
                          <AlertIcon />
                          <Box>
                            <Text fontWeight="bold">Detecções de Câncer de Mama</Text>
                            <Text fontSize="sm">
                              {`Foram detectadas ${boundingBoxes.length} áreas suspeitas na imagem.`}
                            </Text>
                          </Box>
                        </Alert>
                      )}
                    </VStack>
                  </GridItem>
                </Grid>
                
                <Flex justify="flex-end" mt={8}>
                  <Button 
                    colorScheme="gray" 
                    mr={3}
                    onClick={() => navigate(-1)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    colorScheme="primary" 
                    type="submit"
                    isLoading={createAttendance.isLoading}
                    loadingText="Salvando..."
                  >
                    Salvar Atendimento
                  </Button>
                </Flex>
              </Form>
            )}
          </Formik>
        </CardBody>
      </Card>
      
      {/* Prediction Details Modal */}
      {predictionData && (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              Detalhes da Predição
              <CloseButton 
                size="sm"
                position="absolute"
                right={3}
                top={3}
                onClick={onClose}
              />
            </ModalHeader>
            <ModalBody>
              {predictionData.model === 'respiratory' && (
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm">Probabilidades por Doença</Heading>
                  {Object.entries(predictionData.result.prediction)
                    .sort(([, valueA], [, valueB]) => (valueB as number) - (valueA as number))
                    .map(([disease, probability]) => (
                      <Box key={disease}>
                        <Flex justify="space-between" mb={1}>
                          <Text>{disease}</Text>
                          <Text fontWeight="bold">{(probability as number).toFixed(2)}%</Text>
                        </Flex>
                        <Progress 
                          value={probability as number} 
                          max={100} 
                          size="sm" 
                          colorScheme={(probability as number) > 50 ? "red" : (probability as number) > 30 ? "yellow" : "green"} 
                          borderRadius="full"
                        />
                      </Box>
                    ))}
                </VStack>
              )}
              
              {predictionData.model === 'tuberculosis' && (
                <VStack align="stretch" spacing={4}>
                  <Flex 
                    justify="center" 
                    bg={predictionData.result.prediction.class_pred === 'positive' ? "red.50" : "green.50"} 
                    p={4} 
                    borderRadius="md"
                  >
                    <Badge 
                      fontSize="xl" 
                      p={2}
                      borderRadius="md" 
                      colorScheme={predictionData.result.prediction.class_pred === 'positive' ? "red" : "green"}
                    >
                      {predictionData.result.prediction.class_pred === 'positive' 
                        ? "Positivo para Tuberculose" 
                        : "Negativo para Tuberculose"}
                    </Badge>
                  </Flex>
                  
                  <Heading size="sm" mt={4}>Probabilidades</Heading>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Negativo</Text>
                      <Text fontWeight="bold">{predictionData.result.prediction.probabilities.negative.toFixed(2)}%</Text>
                    </Flex>
                    <Progress 
                      value={predictionData.result.prediction.probabilities.negative} 
                      max={100} 
                      size="sm" 
                      colorScheme="green" 
                      borderRadius="full"
                    />
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Positivo</Text>
                      <Text fontWeight="bold">{predictionData.result.prediction.probabilities.positive.toFixed(2)}%</Text>
                    </Flex>
                    <Progress 
                      value={predictionData.result.prediction.probabilities.positive} 
                      max={100} 
                      size="sm" 
                      colorScheme="red" 
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              )}
              
              {predictionData.model === 'osteoporosis' && (
                <VStack align="stretch" spacing={4}>
                  <Flex 
                    justify="center" 
                    p={4} 
                    borderRadius="md"
                    bg={
                      predictionData.result.prediction.class_pred === 'Normal' 
                        ? "green.50" 
                        : predictionData.result.prediction.class_pred === 'Osteopenia'
                          ? "yellow.50"
                          : "red.50"
                    }
                  >
                    <Badge 
                      fontSize="xl" 
                      p={2}
                      borderRadius="md" 
                      colorScheme={
                        predictionData.result.prediction.class_pred === 'Normal' 
                          ? "green" 
                          : predictionData.result.prediction.class_pred === 'Osteopenia'
                            ? "yellow"
                            : "red"
                      }
                    >
                      {predictionData.result.prediction.class_pred}
                    </Badge>
                  </Flex>
                  
                  <Heading size="sm" mt={4}>Probabilidades</Heading>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Normal</Text>
                      <Text fontWeight="bold">{predictionData.result.prediction.probabilities.Normal.toFixed(2)}%</Text>
                    </Flex>
                    <Progress 
                      value={predictionData.result.prediction.probabilities.Normal} 
                      max={100} 
                      size="sm" 
                      colorScheme="green" 
                      borderRadius="full"
                    />
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Osteopenia</Text>
                      <Text fontWeight="bold">{predictionData.result.prediction.probabilities.Osteopenia.toFixed(2)}%</Text>
                    </Flex>
                    <Progress 
                      value={predictionData.result.prediction.probabilities.Osteopenia} 
                      max={100} 
                      size="sm" 
                      colorScheme="yellow" 
                      borderRadius="full"
                    />
                  </Box>
                  
                  <Box>
                    <Flex justify="space-between" mb={1}>
                      <Text>Osteoporose</Text>
                      <Text fontWeight="bold">{predictionData.result.prediction.probabilities.Osteoporosis.toFixed(2)}%</Text>
                    </Flex>
                    <Progress 
                      value={predictionData.result.prediction.probabilities.Osteoporosis} 
                      max={100} 
                      size="sm" 
                      colorScheme="red" 
                      borderRadius="full"
                    />
                  </Box>
                </VStack>
              )}
              
              {predictionData.model === 'breast' && (
                <VStack align="stretch" spacing={4}>
                  <Heading size="sm">Detecções</Heading>
                  
                  <Box borderRadius="md" overflow="hidden" borderWidth={1} borderColor="gray.200">
                    <Image
                      src={`data:image/jpeg;base64,${predictionData.result.image_base64}`}
                      alt="Mamografia com detecções"
                      maxH="300px"
                      mx="auto"
                      objectFit="contain"
                    />
                  </Box>
                  
                  <Text>
                    {predictionData.result.detections.length === 0
                      ? "Nenhuma área suspeita detectada"
                      : `${predictionData.result.detections.length} ${
                          predictionData.result.detections.length === 1
                            ? "área suspeita detectada"
                            : "áreas suspeitas detectadas"
                        }`}
                  </Text>
                  
                  {predictionData.result.detections.length > 0 && (
                    <Alert status="warning" borderRadius="md">
                      <AlertIcon />
                      <Text fontSize="sm">
                        As áreas destacadas em vermelho representam regiões suspeitas identificadas pelo modelo de IA.
                      </Text>
                    </Alert>
                  )}
                </VStack>
              )}
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="primary" onClick={onClose}>
                Fechar
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default NewAttendancePage;