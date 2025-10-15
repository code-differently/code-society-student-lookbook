import { useEffect, useState, useCallback } from 'react'
import {
  Box,
  Container,
  Heading,
  VStack,
  Text,
  Badge,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  Stack,
  StackDivider,
  useColorModeValue,
  Collapse,
  IconButton,
  HStack,
  useDisclosure,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  Button,
  Flex,
  Grid,
  GridItem,
  Divider,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Checkbox,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Image,
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, SearchIcon, DownloadIcon, ExternalLinkIcon } from '@chakra-ui/icons'
import FilterPanel, { FilterState } from '../components/FilterPanel'
import NextImage from 'next/image'
import { Submission } from '@/interfaces/Submission'

interface ApiResponse {
  submissions: Submission[]
  totalCount: number
  hasMore: boolean
}

function SubmissionCard({ submission, isSelected, onSelect }: { submission: Submission, isSelected: boolean, onSelect: (id: string) => void }) {
  const { isOpen, onToggle } = useDisclosure()
  const { isOpen: isModalOpen, onOpen: onModalOpen, onClose: onModalClose } = useDisclosure()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  const handleDownloadHeadshot = (e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `/api/serve-file?studentId=${submission.id}&type=headshot`
    const link = document.createElement('a')
    link.href = url
    link.download = `${submission.fullName.replace(/[^a-zA-Z0-9]/g, '_')}_headshot.jpg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleHeadshotClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onModalOpen()
  }

  return (
    <>
    <Card 
      bg={cardBg} 
        border="1px solid"
        borderColor={borderColor}
        borderRadius="xl"
        boxShadow="sm"
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      cursor="pointer"
      onClick={onToggle}
    >
        <CardBody p={6}>
        <Stack spacing={4}>
            <HStack justify="space-between" align="flex-start">
              <Box flex={1}>
                <HStack align="center" spacing={4} mb={1}>
                  <Checkbox
                    isChecked={isSelected}
                    onChange={() => onSelect(submission.id)}
                    colorScheme="blue"
                    mr={2}
                    aria-label={`Select ${submission.fullName}`}
                  />
                  <Heading size="md" color="gray.800">
                    {submission.fullName}
                  </Heading>
                </HStack>
                <Text color="gray.500" fontSize="sm" mb={3}>
                {submission.email}
              </Text>
                <HStack spacing={3}>
                  <Badge colorScheme="blue" variant="subtle" px={2} py={1}>
                  {submission.technicalSkills.length} Skills
                </Badge>
                  <Badge colorScheme="purple" variant="subtle" px={2} py={1}>
                  {submission.careerInterests.length} Interests
                </Badge>
                  <Badge colorScheme="green" variant="subtle" px={2} py={1}>
                    {submission.certifications.length} Certs
                  </Badge>
              </HStack>
            </Box>
              
              {/* Headshot on the right side */}
              <VStack spacing={2} align="center">
                {submission.headshotUrl ? (
                  <Box position="relative">
                    <Box 
                      boxSize="80px" 
                      minW="80px" 
                      borderRadius="full" 
                      overflow="hidden" 
                      border="3px solid" 
                      borderColor="gray.200"
                      cursor="pointer"
                      onClick={handleHeadshotClick}
                      _hover={{ 
                        borderColor: 'blue.400',
                        transform: 'scale(1.05)',
                        boxShadow: 'lg'
                      }}
                      transition="all 0.2s"
                    >
                      <NextImage
                        src={`/api/serve-file?studentId=${submission.id}&type=headshot`}
                        alt={submission.fullName + ' headshot'}
                        width={80}
                        height={80}
                        style={{ 
                          width: '100%', 
                          height: '100%', 
                          objectFit: 'cover',
                          borderRadius: '50%'
                        }}
                      />
                    </Box>
                    {/* Hover overlay */}
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      right="0"
                      bottom="0"
                      bg="rgba(0,0,0,0.5)"
                      borderRadius="full"
                      display="flex"
                      alignItems="center"
                      justifyContent="center"
                      opacity="0"
                      _hover={{ opacity: 1 }}
                      transition="opacity 0.2s"
                      cursor="pointer"
                      onClick={handleHeadshotClick}
                    >
                      <Text color="white" fontSize="xs" fontWeight="bold">
                        Click to view
                      </Text>
                    </Box>
                  </Box>
                ) : (
                  <Box 
                    boxSize="80px" 
                    minW="80px" 
                    borderRadius="full" 
                    bg="gray.100" 
                    display="flex" 
                    alignItems="center" 
                    justifyContent="center" 
                    fontSize="sm" 
                    color="gray.400" 
                    border="3px solid" 
                    borderColor="gray.200"
                  >
                    No Photo
                  </Box>
                )}
                <Text fontSize="xs" color="gray.500" textAlign="center">
                  {submission.headshotUrl ? 'Click to view' : 'No headshot'}
                </Text>
              </VStack>

            <IconButton
              aria-label={isOpen ? 'Collapse' : 'Expand'}
              icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              variant="ghost"
                size="sm"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            />
          </HStack>

          <Collapse in={isOpen} animateOpacity>
              <Divider my={4} />
              <Stack divider={<StackDivider />} spacing={4}>
                <Box>
                  <Text fontWeight="600" mb={2} color="gray.700">Education</Text>
                  {submission.educationDegree && submission.educationDegree.length > 0 ? (
                    <Wrap spacing={2} mb={2}>
                      {submission.educationDegree.map((degree, index) => (
                        <WrapItem key={index}>
                          <Badge colorScheme="teal" variant="solid" px={2} py={1} borderRadius="md">
                            {degree}
                          </Badge>
                        </WrapItem>
                      ))}
                    </Wrap>
                  ) : (
                    <Text color="gray.600" fontSize="sm">No education background specified</Text>
                  )}
                  {submission.educationField && (
                    <Text color="gray.600" fontSize="sm" mt={1}>
                      Field of Study: {submission.educationField}
                    </Text>
                  )}
                </Box>

              <Box>
                  <Text fontWeight="600" mb={2} color="gray.700">Years of Experience</Text>
                  <Text color="gray.600" fontSize="sm">
                    {submission.yearsOfExperience || '—'}
                  </Text>
              </Box>

              <Box>
                  <Text fontWeight="600" mb={3} color="gray.700">Technical Skills</Text>
                  <Wrap spacing={2}>
                  {submission.technicalSkills.map((skill, index) => (
                    <WrapItem key={index}>
                        <Badge colorScheme="blue" variant="solid" px={2} py={1} borderRadius="md">
                          {skill}
                        </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                  <Text fontWeight="600" mb={3} color="gray.700">Certifications</Text>
                  <Wrap spacing={2}>
                  {submission.certifications.map((cert) => (
                    <WrapItem key={cert.name}>
                        <Badge colorScheme="green" variant="solid" px={2} py={1} borderRadius="md">
                          {cert.name}
                          {cert.status ? (
                            <Text as="span" fontWeight="normal" fontSize="xs" color="white" ml={2}>
                              ({cert.status})
                            </Text>
                          ) : null}
                        </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                  <Text fontWeight="600" mb={3} color="gray.700">Career Interests</Text>
                  <Wrap spacing={2}>
                  {submission.careerInterests.map((interest, index) => (
                    <WrapItem key={index}>
                        <Badge colorScheme="purple" variant="solid" px={2} py={1} borderRadius="md">
                          {interest}
                        </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                  <Text fontWeight="600" mb={3} color="gray.700">Work Experience</Text>
                  <Wrap spacing={2}>
                  {submission.workExperience.map((exp, index) => (
                    <WrapItem key={index}>
                        <Badge colorScheme="orange" variant="solid" px={2} py={1} borderRadius="md">
                          {exp}
                        </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                  <Text fontWeight="600" mb={3} color="gray.700">Links</Text>
                  <HStack spacing={4}>
                  {submission.linkedinUrl && (
                      <Button
                        as="a"
                        href={submission.linkedinUrl}
                        target="_blank"
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                      >
                      LinkedIn
                      </Button>
                  )}
                  {submission.githubUrl && (
                      <Button
                        as="a"
                        href={submission.githubUrl}
                        target="_blank"
                        size="sm"
                        colorScheme="gray"
                        variant="outline"
                      >
                      GitHub
                      </Button>
                  )}
                  {submission.resumeUrl && (
                      <Button
                        as="a"
                        href={`/api/serve-file?studentId=${submission.id}&type=resume`}
                        target="_blank"
                        size="sm"
                        colorScheme="green"
                        variant="outline"
                      >
                      Resume
                      </Button>
                  )}
                  </HStack>
              </Box>

                <Text fontSize="sm" color="gray.500" textAlign="right">
                Submitted on {new Date(submission.createdAt).toLocaleDateString()}
              </Text>
            </Stack>
          </Collapse>
        </Stack>
      </CardBody>
    </Card>

      {/* Headshot Modal */}
      <Modal isOpen={isModalOpen} onClose={onModalClose} size="lg" isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {submission.fullName} - Headshot
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <VStack spacing={4}>
              <Box
                borderRadius="lg"
                overflow="hidden"
                boxShadow="lg"
                bg="gray.50"
                p={4}
              >
                <Image
                  src={`/api/serve-file?studentId=${submission.id}&type=headshot`}
                  alt={`${submission.fullName} headshot`}
                  maxH="400px"
                  mx="auto"
                  objectFit="contain"
                />
              </Box>
              <HStack spacing={4}>
                <Button
                  leftIcon={<DownloadIcon />}
                  colorScheme="blue"
                  onClick={handleDownloadHeadshot}
                >
                  Download Headshot
                </Button>
                <Button
                  variant="outline"
                  onClick={onModalClose}
                >
                  Close
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  )
}

export default function Submissions() {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    skills: [],
    certifications: [],
    interests: [],
    workExperience: [],
    dateFrom: '',
    dateTo: '',
    sortBy: 'newest',
    skillCombination: 'any',
    minSkills: 0,
    maxSkills: 0,
    hasAnyCertification: false,
    hasWorkExperience: false,
    profileCompleteness: 'any',
    skillLevel: 'any',
    certificationLevel: 'any',
    yearsOfExperience: [],
    educationDegrees: [],
    educationField: '',
  })
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [exporting, setExporting] = useState(false)

  const buildQueryString = useCallback((filters: FilterState) => {
    const params = new URLSearchParams()
    
    if (filters.search) params.append('search', filters.search)
    if (filters.skills.length > 0) params.append('skills', filters.skills.join(','))
    if (filters.certifications.length > 0) params.append('certifications', filters.certifications.join(','))
    if (filters.interests.length > 0) params.append('interests', filters.interests.join(','))
    if (filters.workExperience.length > 0) params.append('workExperience', filters.workExperience.join(','))
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom)
    if (filters.dateTo) params.append('dateTo', filters.dateTo)
    if (filters.sortBy) params.append('sortBy', filters.sortBy)
    
    // New advanced filters
    if (filters.skillCombination && filters.skillCombination !== 'any') {
      params.append('skillCombination', filters.skillCombination)
    }
    if (filters.minSkills > 0) params.append('minSkills', filters.minSkills.toString())
    if (filters.maxSkills > 0) params.append('maxSkills', filters.maxSkills.toString())
    if (filters.hasAnyCertification) params.append('hasAnyCertification', 'true')
    if (filters.hasWorkExperience) params.append('hasWorkExperience', 'true')
    if (filters.profileCompleteness && filters.profileCompleteness !== 'any') {
      params.append('profileCompleteness', filters.profileCompleteness)
    }
    if (filters.skillLevel && filters.skillLevel !== 'any') {
      params.append('skillLevel', filters.skillLevel)
    }
    if (filters.certificationLevel && filters.certificationLevel !== 'any') {
      params.append('certificationLevel', filters.certificationLevel)
    }
    
    // Education filters
    if (filters.yearsOfExperience && filters.yearsOfExperience.length > 0) {
      params.append('yearsOfExperience', filters.yearsOfExperience.join(','))
    }
    if (filters.educationDegrees && filters.educationDegrees.length > 0) {
      params.append('educationDegrees', filters.educationDegrees.join(','))
    }
    if (filters.educationField) {
      params.append('educationField', filters.educationField)
    }
    
    return params.toString()
  }, [])

  const fetchSubmissions = useCallback(async (currentFilters: FilterState) => {
    setLoading(true)
    setError(null)
    
    try {
      const queryString = buildQueryString(currentFilters)
      const url = queryString ? `/api/submissions?${queryString}` : '/api/submissions'
      
      const response = await fetch(url)
        if (!response.ok) throw new Error('Failed to fetch submissions')
      
      const data: ApiResponse = await response.json()
      setSubmissions(data.submissions)
      setTotalCount(data.totalCount)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
  }, [buildQueryString])

  useEffect(() => {
    fetchSubmissions(filters)
  }, [filters, fetchSubmissions])

  const handleFiltersChange = useCallback((newFilters: FilterState) => {
    setFilters(newFilters)
  }, [])

  const handleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((sid) => sid !== id) : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === submissions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(submissions.map((s) => s.id))
    }
  }

  const handleExportProfiles = async () => {
    if (selectedIds.length === 0) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedIds }),
      })
      if (!res.ok) throw new Error('Failed to export profiles')
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'student-profiles.html'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error exporting profiles')
    } finally {
      setExporting(false)
    }
  }

  const handleExportResumes = async () => {
    if (selectedIds.length === 0) return
    setExporting(true)
    try {
      const res = await fetch('/api/export-resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentIds: selectedIds }),
      })
      if (!res.ok) throw new Error('Failed to export resumes\n');
      const blob = await res.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'student-resumes.zip'
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch (e) {
      alert('Error exporting resumes')
    } finally {
      setExporting(false)
    }
  }

  if (error) {
    return (
      <Container maxW="container.xl" py={10}>
        <Alert status="error" borderRadius="lg">
          <AlertIcon />
          Error: {error}
        </Alert>
      </Container>
    )
  }

  return (
    <Box minH="100vh" bg={bgColor} py={8}>
      <Container maxW="container.xl">
        {/* Header */}
        <Box mb={8}>
          <Flex align="center" mb={2}>
            <SearchIcon color="blue.600" boxSize={6} mr={3} />
            <Heading size="xl" color="gray.800" fontWeight="700">
          Student Submissions
        </Heading>
          </Flex>
          <Text color="gray.600" fontSize="lg">
            Browse and filter through student applications
          </Text>
        </Box>

        {/* Stats */}
        <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6} mb={8}>
          <Card bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">Total Submissions</StatLabel>
                <StatNumber color="gray.800" fontSize="2xl" fontWeight="700">
                  {loading ? '...' : totalCount}
                </StatNumber>
                <StatHelpText color="gray.500">All time</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">Showing</StatLabel>
                <StatNumber color="gray.800" fontSize="2xl" fontWeight="700">
                  {loading ? '...' : submissions.length}
                </StatNumber>
                <StatHelpText color="gray.500">Filtered results</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl">
            <CardBody p={6}>
              <Stat>
                <StatLabel color="gray.600" fontSize="sm">Active Filters</StatLabel>
                <StatNumber color="gray.800" fontSize="2xl" fontWeight="700">
                  {filters.skills.length + filters.certifications.length + filters.interests.length + filters.workExperience.length}
                </StatNumber>
                <StatHelpText color="gray.500">Applied</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Content */}
        <Grid templateColumns={{ base: '1fr', lg: 'auto 1fr' }} gap={8}>
          {/* Filter Sidebar */}
          <GridItem>
            <FilterPanel onFiltersChange={handleFiltersChange} isLoading={loading} />
          </GridItem>

          {/* Export/Selection Controls */}
          <GridItem>
            <Flex mb={4} align="center" gap={4} wrap="wrap">
              <Checkbox
                isChecked={selectedIds.length === submissions.length && submissions.length > 0}
                isIndeterminate={selectedIds.length > 0 && selectedIds.length < submissions.length}
                onChange={handleSelectAll}
                colorScheme="blue"
              >
                Select All
              </Checkbox>
              <Button
                colorScheme="blue"
                leftIcon={<ExternalLinkIcon />}
                onClick={handleExportProfiles}
                isLoading={exporting}
                isDisabled={selectedIds.length === 0}
              >
                Export Profiles
              </Button>
              <Button
                colorScheme="green"
                leftIcon={<DownloadIcon />}
                onClick={handleExportResumes}
                isLoading={exporting}
                isDisabled={selectedIds.length === 0}
              >
                Download Resumes
              </Button>
              <Text color="gray.500" fontSize="sm">
                {selectedIds.length} selected
              </Text>
            </Flex>

            {/* Loading State */}
            {loading && (
              <Center py={20}>
                <VStack spacing={4}>
                  <Spinner size="xl" color="blue.500" />
                  <Text color="gray.600">Loading submissions...</Text>
                </VStack>
              </Center>
            )}

            {/* No Results */}
            {!loading && submissions.length === 0 && (
              <Card bg="white" border="1px solid" borderColor="gray.200" borderRadius="xl">
                <CardBody p={12} textAlign="center">
                  <Alert status="info" variant="subtle" borderRadius="lg" mb={4}>
                    <AlertIcon />
                    No submissions found matching your criteria
                  </Alert>
                  <Text color="gray.600" mb={4}>
                    Try adjusting your filters or search terms to find more results.
                  </Text>
                  <Button colorScheme="blue" onClick={() => setFilters({
                    search: '',
                    skills: [],
                    certifications: [],
                    interests: [],
                    workExperience: [],
                    dateFrom: '',
                    dateTo: '',
                    sortBy: 'newest',
                    skillCombination: 'any',
                    minSkills: 0,
                    maxSkills: 0,
                    hasAnyCertification: false,
                    hasWorkExperience: false,
                    profileCompleteness: 'any',
                    skillLevel: 'any',
                    certificationLevel: 'any',
                  })}>
                    Clear All Filters
                  </Button>
                </CardBody>
              </Card>
            )}

            {/* Submissions List */}
            {!loading && submissions.length > 0 && (
        <VStack spacing={4} align="stretch">
          {submissions.map((submission) => (
            <SubmissionCard
              key={submission.id}
              submission={submission}
              isSelected={selectedIds.includes(submission.id)}
              onSelect={handleSelect}
            />
          ))}
        </VStack>
            )}
          </GridItem>
        </Grid>
    </Container>
    </Box>
  )
}