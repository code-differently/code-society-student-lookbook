import { useEffect, useState } from 'react'
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
} from '@chakra-ui/react'
import { ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons'

interface Submission {
  id: string
  fullName: string
  email: string
  linkedinUrl: string | null
  githubUrl: string | null
  shortBio: string
  resumeUrl: string
  availableForWork: boolean
  technicalSkills: { name: string }[]
  certifications: { name: string }[]
  careerInterests: { name: string }[]
  workExperience: { name: string }[]
  createdAt: string
}

function SubmissionCard({ submission }: { submission: Submission }) {
  const { isOpen, onToggle } = useDisclosure()
  const cardBg = useColorModeValue('white', 'gray.700')
  const hoverBg = useColorModeValue('gray.50', 'gray.600')

  return (
    <Card 
      bg={cardBg} 
      boxShadow="md" 
      transition="all 0.2s"
      _hover={{ transform: 'translateY(-2px)', boxShadow: 'lg' }}
      cursor="pointer"
      onClick={onToggle}
    >
      <CardBody>
        <Stack spacing={4}>
          <HStack justify="space-between" align="center">
            <Box>
              <Heading size="md">{submission.fullName}</Heading>
              <Text color="gray.500" fontSize="sm">
                {submission.email}
              </Text>
              <HStack mt={2} spacing={2}>
                {submission.availableForWork && (
                  <Badge colorScheme="green">Available for Work</Badge>
                )}
                <Badge colorScheme="blue">
                  {submission.technicalSkills.length} Skills
                </Badge>
                <Badge colorScheme="purple">
                  {submission.careerInterests.length} Interests
                </Badge>
              </HStack>
            </Box>
            <IconButton
              aria-label={isOpen ? 'Collapse' : 'Expand'}
              icon={isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                onToggle()
              }}
            />
          </HStack>

          <Collapse in={isOpen} animateOpacity>
            <Stack divider={<StackDivider />} spacing={4} pt={4}>
              <Box>
                <Text fontWeight="bold" mb={2}>Bio</Text>
                <Text>{submission.shortBio}</Text>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Technical Skills</Text>
                <Wrap>
                  {submission.technicalSkills.map((skill) => (
                    <WrapItem key={skill.name}>
                      <Badge colorScheme="blue">{skill.name}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Certifications</Text>
                <Wrap>
                  {submission.certifications.map((cert) => (
                    <WrapItem key={cert.name}>
                      <Badge colorScheme="green">{cert.name}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Career Interests</Text>
                <Wrap>
                  {submission.careerInterests.map((interest) => (
                    <WrapItem key={interest.name}>
                      <Badge colorScheme="purple">{interest.name}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Work Experience</Text>
                <Wrap>
                  {submission.workExperience.map((exp) => (
                    <WrapItem key={exp.name}>
                      <Badge colorScheme="orange">{exp.name}</Badge>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>

              <Box>
                <Text fontWeight="bold" mb={2}>Links</Text>
                <Stack direction="row" spacing={4}>
                  {submission.linkedinUrl && (
                    <Text as="a" href={submission.linkedinUrl} color="blue.500" target="_blank">
                      LinkedIn
                    </Text>
                  )}
                  {submission.githubUrl && (
                    <Text as="a" href={submission.githubUrl} color="blue.500" target="_blank">
                      GitHub
                    </Text>
                  )}
                  {submission.resumeUrl && (
                    <Text as="a" href={submission.resumeUrl} color="blue.500" target="_blank">
                      Resume
                    </Text>
                  )}
                </Stack>
              </Box>

              <Text fontSize="sm" color="gray.500">
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
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/submissions')
        if (!response.ok) throw new Error('Failed to fetch submissions')
        const data = await response.json()
        setSubmissions(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchSubmissions()
  }, [])

  if (loading) return <Text>Loading submissions...</Text>
  if (error) return <Text color="red.500">Error: {error}</Text>

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Heading
          as="h1"
          size="xl"
          textAlign="center"
          mb={6}
          color="black"
          fontFamily="'Inter', sans-serif"
          fontWeight="800"
          letterSpacing="tight"
        >
          Student Submissions
        </Heading>

        <VStack spacing={4} align="stretch">
          {submissions.map((submission) => (
            <SubmissionCard key={submission.id} submission={submission} />
          ))}
        </VStack>
      </VStack>
    </Container>
  )
} 