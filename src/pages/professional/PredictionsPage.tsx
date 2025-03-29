import { useState, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  SimpleGrid,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Image,
  Card,
  CardBody,
  CardHeader,
  Progress,
  Divider,
  Badge,
  Flex,
  useColorModeValue,
  FormControl,
  FormLabel,
  Select,
  Spinner
} from '@chakra-ui/react';
import { useDropzone } from 'react-dropzone';
import { FiUpload, FiCheck, FiDownload } from 'react-icons/fi';
import { useMutation } from 'react-query';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { 
  RespiratoryPrediction, 
  TuberculosisPrediction, 
  OsteoporosisPrediction, 
  BreastCancerDetection 
} from '../../types';

type ModelType = 'respiratory' | 'tuberculosis' | 'osteoporosis' | 'breast';

const PredictionsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [modelType, setModelType] = useState<ModelType>('respiratory');
  const { authState } = useAuth();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const dropzoneBg = useColorModeValue('white', 'gray.800');

  // State for prediction results
  const [respiratoryResult, setRespiratoryResult] = useState<RespiratoryPrediction | null>(null);
  const [tuberculosisResult, setTuberculosisResult] = useState<TuberculosisPrediction | null>(null);
  const [osteoporosisResult, setOsteoporosisResult] = useState<OsteoporosisPrediction | null>(null);
  const [breastResult, setBreastResult] = useState<BreastCancerDetection | null>(null);

  // Reset states when changing model type
  const handleModelTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const type = e.target.value as ModelType;
    setModelType(type);
    setSelectedFile(null);
    setPreviewImage(null);
    setResultImage(null);
    setRespiratoryResult(null);
    setTuberculosisResult(null);
    setOsteoporosisResult(null);
    setBreastResult(null);
  };

  // DropZone configuration
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/dicom': []
    },
    maxFiles: 1,
    maxSize: 10485760, // 10 MB
  });

  // Mutation for making predictions
  const predictionMutation = useMutation(
    async ({ file, model }: { file: File, model: ModelType }) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(`/api/predictions/${model}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      return { 
        data: response.data.detail,
        model 
      };
    },
    {
      onSuccess: (result) => {
        // Handle different model results
        const { data, model } = result;
        
        switch (model) {
          case 'respiratory':
            setRespiratoryResult(data.prediction);
            break;
          case 'tuberculosis':
            setTuberculosisResult(data.prediction);
            break;
          case 'osteoporosis':
            setOsteoporosisResult(data.prediction);
            break;
          case 'breast':
            setBreastResult(data);
            setResultImage(data.image_base64 ? `data:image/jpeg;base64,${data.image_base64}` : null);
            break;
        }
        
        // Go to results tab
        setActiveTab(1);
        
        toast({
          title: 'Predição concluída',
          description: 'A imagem foi analisada com sucesso',
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      },
      onError: (error: any) => {
        toast({
          title: 'Erro na predição',
          description: error.response?.data?.detail?.message || 'Ocorreu um erro ao processar a imagem',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      },
    }
  );

  const handlePrediction = () => {
    if (!selectedFile) {
      toast({
        title: 'Nenhum arquivo selecionado',
        description: 'Por favor, selecione uma imagem para análise',
        status: 'warning',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    predictionMutation.mutate({ file: selectedFile, model: modelType });
  };

  const downloadImage = () => {
    if (resultImage) {
      const link = document.createElement('a');
      link.href = resultImage;
      link.download = `prediction-result-${modelType}.jpg`;
      link.click();
    }
  };

  // Render prediction results based on model type
  const renderPredictionResults = () => {
    if (predictionMutation.isLoading) {
      return (
        <Box textAlign="center" py={10}>
          <Spinner size="xl" color="primary.500" thickness="4px" />
          <Text mt={4}>Processando sua imagem...</Text>
        </Box>
      );
    }

    switch (modelType) {
      case 'respiratory':
        return renderRespiratoryResults();
      case 'tuberculosis':
        return renderTuberculosisResults();
      case 'osteoporosis':
        return renderOsteoporosisResults();
      case 'breast':
        return renderBreastResults();
      default:
        return <Text>Selecione um modelo e faça o upload de uma imagem</Text>;
    }
  };

  const renderRespiratoryResults = () => {
    if (!respiratoryResult) return null;

    // Sort diseases by probability (descending)
    const sortedDiseases = Object.entries(respiratoryResult)
      .sort(([, probA], [, probB]) => probB - probA);

    return (
      <Card>
        <CardHeader>
          <Heading size="md">Resultado da Análise Respiratória</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm">Probabilidades por Condição</Heading>
              {sortedDiseases.map(([disease, probability]) => (
                <Box key={disease}>
                  <Flex justify="space-between" mb={1}>
                    <Text>{disease}</Text>
                    <Text fontWeight="bold">{(probability * 100).toFixed(2)}%</Text>
                  </Flex>
                  <Progress 
                    value={probability * 100} 
                    colorScheme={probability > 0.5 ? "red" : probability > 0.2 ? "yellow" : "green"}
                    borderRadius="full"
                  />
                </Box>
              ))}
              
              <Divider my={2} />
              
              <Box mt={4}>
                <Heading size="sm" mb={2}>Diagnóstico Principal</Heading>
                <Badge 
                  colorScheme={sortedDiseases[0][1] > 0.7 ? "red" : "orange"}
                  fontSize="md"
                  p={2}
                  borderRadius="md"
                >
                  {sortedDiseases[0][0]} ({(sortedDiseases[0][1] * 100).toFixed(2)}%)
                </Badge>
              </Box>
            </VStack>
            
            <Box>
              <Image 
                src={previewImage || ''} 
                alt="Imagem analisada" 
                borderRadius="md"
                maxH="300px"
                margin="0 auto"
              />
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  };

  const renderTuberculosisResults = () => {
    if (!tuberculosisResult) return null;

    const { class_pred, probabilities } = tuberculosisResult;
    const isPositive = class_pred === 'positive';
    
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Resultado da Análise de Tuberculose</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Box textAlign="center" py={4}>
                <Badge 
                  colorScheme={isPositive ? "red" : "green"}
                  fontSize="xl"
                  p={3}
                  borderRadius="md"
                >
                  {isPositive ? 'Positivo para Tuberculose' : 'Negativo para Tuberculose'}
                </Badge>
              </Box>
              
              <Divider my={2} />
              
              <Heading size="sm">Probabilidades</Heading>
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text>Positivo</Text>
                  <Text fontWeight="bold">{(probabilities.positive * 100).toFixed(2)}%</Text>
                </Flex>
                <Progress 
                  value={probabilities.positive * 100} 
                  colorScheme="red"
                  borderRadius="full"
                  mb={3}
                />
                
                <Flex justify="space-between" mb={1}>
                  <Text>Negativo</Text>
                  <Text fontWeight="bold">{(probabilities.negative * 100).toFixed(2)}%</Text>
                </Flex>
                <Progress 
                  value={probabilities.negative * 100} 
                  colorScheme="green"
                  borderRadius="full"
                />
              </Box>
            </VStack>
            
            <Box>
              <Image 
                src={previewImage || ''} 
                alt="Imagem analisada" 
                borderRadius="md"
                maxH="300px"
                margin="0 auto"
              />
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  };

  const renderOsteoporosisResults = () => {
    if (!osteoporosisResult) return null;

    const { class_pred, probabilities } = osteoporosisResult;
    const getColorScheme = () => {
      switch (class_pred) {
        case 'Osteoporosis': return 'red';
        case 'Osteopenia': return 'yellow';
        default: return 'green';
      }
    };
    
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Resultado da Análise de Osteoporose</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Box textAlign="center" py={4}>
                <Badge 
                  colorScheme={getColorScheme()}
                  fontSize="xl"
                  p={3}
                  borderRadius="md"
                >
                  {class_pred}
                </Badge>
              </Box>
              
              <Divider my={2} />
              
              <Heading size="sm">Probabilidades</Heading>
              <Box>
                <Flex justify="space-between" mb={1}>
                  <Text>Normal</Text>
                  <Text fontWeight="bold">{(probabilities.Normal * 100).toFixed(2)}%</Text>
                </Flex>
                <Progress 
                  value={probabilities.Normal * 100} 
                  colorScheme="green"
                  borderRadius="full"
                  mb={3}
                />
                
                <Flex justify="space-between" mb={1}>
                  <Text>Osteopenia</Text>
                  <Text fontWeight="bold">{(probabilities.Osteopenia * 100).toFixed(2)}%</Text>
                </Flex>
                <Progress 
                  value={probabilities.Osteopenia * 100} 
                  colorScheme="yellow"
                  borderRadius="full"
                  mb={3}
                />
                
                <Flex justify="space-between" mb={1}>
                  <Text>Osteoporose</Text>
                  <Text fontWeight="bold">{(probabilities.Osteoporosis * 100).toFixed(2)}%</Text>
                </Flex>
                <Progress 
                  value={probabilities.Osteoporosis * 100} 
                  colorScheme="red"
                  borderRadius="full"
                />
              </Box>
            </VStack>
            
            <Box>
              <Image 
                src={previewImage || ''} 
                alt="Imagem analisada" 
                borderRadius="md"
                maxH="300px"
                margin="0 auto"
              />
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  };

  const renderBreastResults = () => {
    if (!breastResult) return null;
    
    return (
      <Card>
        <CardHeader>
          <Heading size="md">Resultado da Detecção de Câncer de Mama</Heading>
        </CardHeader>
        <Divider />
        <CardBody>
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
            <VStack align="stretch" spacing={4}>
              <Heading size="sm">Detecções ({breastResult.detections.length})</Heading>
              
              {breastResult.detections.length === 0 ? (
                <Text>Nenhuma anomalia detectada</Text>
              ) : (
                <VStack align="stretch" spacing={2}>
                  {breastResult.bounding_boxes.map((box, index) => (
                    <Box key={index} p={3} borderWidth="1px" borderRadius="md" borderColor={borderColor}>
                      <Flex justify="space-between">
                        <Text fontWeight="bold">Detecção {index + 1}</Text>
                        <Badge colorScheme="red">
                          {(box.confidence * 100).toFixed(1)}% confiança
                        </Badge>
                      </Flex>
                      {box.observations && (
                        <Text fontSize="sm" mt={1}>{box.observations}</Text>
                      )}
                    </Box>
                  ))}
                </VStack>
              )}
              
              {resultImage && (
                <Button 
                  leftIcon={<FiDownload />} 
                  colorScheme="primary"
                  onClick={downloadImage}
                  mt={4}
                >
                  Baixar imagem com detecções
                </Button>
              )}
            </VStack>
            
            <Box>
              <Image 
                src={resultImage || previewImage || ''} 
                alt="Imagem analisada com detecções" 
                borderRadius="md"
                maxW="100%"
                margin="0 auto"
              />
            </Box>
          </SimpleGrid>
        </CardBody>
      </Card>
    );
  };

  return (
    <Box py={8}>
      <Heading mb={6} color="primary.700">Predições</Heading>
      
      <Tabs index={activeTab} onChange={setActiveTab} colorScheme="primary" mb={6}>
        <TabList>
          <Tab>Nova Predição</Tab>
          <Tab>Resultados</Tab>
        </TabList>
        
        <TabPanels>
          <TabPanel p={0} pt={6}>
            <Card overflow="hidden">
              <CardBody>
                <FormControl mb={6}>
                  <FormLabel fontWeight="medium">Selecione o Modelo</FormLabel>
                  <Select 
                    value={modelType} 
                    onChange={handleModelTypeChange}
                    maxW="400px"
                  >
                    <option value="respiratory">Diagnóstico Respiratório</option>
                    <option value="tuberculosis">Detecção de Tuberculose</option>
                    <option value="osteoporosis">Análise de Osteoporose</option>
                    <option value="breast">Detecção de Câncer de Mama</option>
                  </Select>
                </FormControl>
                
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                  <Box>
                    <Text fontWeight="medium" mb={2}>Upload de Imagem</Text>
                    <Box
                      {...getRootProps()}
                      p={6}
                      borderWidth="2px"
                      borderRadius="md"
                      borderColor={isDragActive ? 'primary.500' : borderColor}
                      borderStyle="dashed"
                      bg={dropzoneBg}
                      cursor="pointer"
                      textAlign="center"
                      transition="all 0.2s"
                      _hover={{ borderColor: 'primary.500' }}
                      minH="200px"
                      display="flex"
                      flexDirection="column"
                      alignItems="center"
                      justifyContent="center"
                    >
                      <input {...getInputProps()} />
                      <Box
                        as={FiUpload}
                        fontSize="3xl"
                        mb={3}
                        color={isDragActive ? 'primary.500' : 'gray.400'}
                      />
                      {isDragActive ? (
                        <Text color="primary.500">Solte a imagem aqui...</Text>
                      ) : (
                        <>
                          <Text mb={1}>Arraste e solte uma imagem aqui, ou clique para selecionar</Text>
                          <Text fontSize="sm" color="gray.500">
                            Formatos aceitos: JPEG, PNG. Tamanho máximo: 10MB
                          </Text>
                        </>
                      )}
                    </Box>
                    
                    <Button
                      colorScheme="primary"
                      size="lg"
                      leftIcon={<FiCheck />}
                      mt={4}
                      width="full"
                      onClick={handlePrediction}
                      isLoading={predictionMutation.isLoading}
                      isDisabled={!selectedFile}
                    >
                      Analisar Imagem
                    </Button>
                  </Box>
                  
                  <Box>
                    <Text fontWeight="medium" mb={2}>Pré-visualização</Text>
                    {previewImage ? (
                      <Box
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                        bg={dropzoneBg}
                        p={4}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minH="200px"
                      >
                        <Image 
                          src={previewImage} 
                          alt="Preview" 
                          maxH="300px"
                          borderRadius="md"
                        />
                      </Box>
                    ) : (
                      <Box
                        borderWidth="1px"
                        borderRadius="md"
                        borderColor={borderColor}
                        bg={dropzoneBg}
                        p={4}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        minH="200px"
                      >
                        <Text color="gray.500">
                          Nenhuma imagem selecionada
                        </Text>
                      </Box>
                    )}
                    
                    {selectedFile && (
                      <Text fontSize="sm" color="gray.500" mt={2}>
                        {selectedFile.name} ({(selectedFile.size / (1024 * 1024)).toFixed(2)} MB)
                      </Text>
                    )}
                  </Box>
                </SimpleGrid>
                
                <Box mt={8} bg="gray.50" p={4} borderRadius="md">
                  <Heading size="sm" mb={2}>Informações do Modelo: {modelType}</Heading>
                  <Text fontSize="sm">
                    {modelType === 'respiratory' && 'Este modelo identifica 14 condições pulmonares diferentes, incluindo pneumonia, COVID-19, e tuberculose.'}
                    {modelType === 'tuberculosis' && 'Este modelo é especializado na detecção de tuberculose a partir de raio-x torácico.'}
                    {modelType === 'osteoporosis' && 'Este modelo analisa imagens de DEXA para identificar osteoporose e osteopenia.'}
                    {modelType === 'breast' && 'Este modelo detecta e localiza potenciais lesões em mamografias, auxiliando no diagnóstico precoce de câncer de mama.'}
                  </Text>
                </Box>
              </CardBody>
            </Card>
          </TabPanel>
          
          <TabPanel p={0} pt={6}>
            {renderPredictionResults()}
          </TabPanel>
        </TabPanels>
      </Tabs>
    </Box>
  );
};

export default PredictionsPage;