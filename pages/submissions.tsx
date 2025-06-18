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
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon, SearchIcon } from '@chakra-ui/icons'
import FilterPanel, { FilterState } from '../components/FilterPanel'

interface Submission {
  id: string
  fullName: string
  email: string
  linkedinUrl: string | null
  githubUrl: string | null
  professionalStatement: string
  resumeUrl: string
  technicalSkills: { name: string }[]
  certifications: { name: string }[]
  careerInterests: { name: string }[]
  workExperience: { name: string }[]
  createdAt: string
}

interface ApiResponse {
  submissions: Submission[]
  totalCount: number
  hasMore: boolean
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const { isOpen, onToggle } = useDisclosure()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')

  return (
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
          <HStack justify="space-between" align="center">
            <Box flex={1}>
              <Heading size="md" color="gray.800" mb={1}>
                {submission.fullName}
              </Heading>
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
                <Text fontWeight="600" mb={2} color="gray.700">Professional Statement</Text>
                <Text color="gray.600" fontSize="sm" lineHeight="1.6">
                  {submission.professionalStatement}
                </Text>
              </Box>

              <Box>
                <Text fontWeight="600" mb={3} color="gray.700">Technical Skills</Text>
                <Wrap spacing={2}>
                  {submission.technicalSkills.map((skill) => (
                    <WrapItem key={skill.name}>
                      <Badge colorScheme="blue" variant="solid" px={2} py={1} borderRadius="md">
                        {skill.name}
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
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="600" mb={3} color="gray.700">Career Interests</Text>
                <Wrap spacing={2}>
                  {submission.careerInterests.map((interest) => (
                    <WrapItem key={interest.name}>
                      <Badge colorScheme="purple" variant="solid" px={2} py={1} borderRadius="md">
                        {interest.name}
                      </Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="600" mb={3} color="gray.700">Work Experience</Text>
                <Wrap spacing={2}>
                  {submission.workExperience.map((exp) => (
                    <WrapItem key={exp.name}>
                      <Badge colorScheme="orange" variant="solid" px={2} py={1} borderRadius="md">
                        {exp.name}
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
                      href={submission.resumeUrl}
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
    hasResume: false,
    hasLinkedIn: false,
    skillCombination: 'any',
    minSkills: 0,
    maxSkills: 0,
    hasAnyCertification: false,
    hasWorkExperience: false,
    profileCompleteness: 'any',
    skillLevel: 'any',
    certificationLevel: 'any',
  })

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
    if (filters.hasResume) params.append('hasResume', 'true')
    if (filters.hasLinkedIn) params.append('hasLinkedIn', 'true')
    
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

          {/* Results */}
          <GridItem>
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
                    hasResume: false,
                    hasLinkedIn: false,
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
                  <SubmissionCard key={submission.id} submission={submission} />
                ))}
              </VStack>
            )}
          </GridItem>
        </Grid>
      </Container>
    </Box>
  )
} 