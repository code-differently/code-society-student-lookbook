import { useState, FormEvent, ChangeEvent } from 'react'
import { useRouter } from 'next/router'
import {
  Box,
  Container,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Checkbox,
  Radio,
  RadioGroup,
  Stack,
  Button,
  VStack,
  Text,
  useToast,
  FormErrorMessage,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Collapse,
  ScaleFade,
  useDisclosure,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Icon,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'

interface FormData {
  fullName: string
  email: string
  linkedinUrl: string
  githubUrl: string
  shortBio: string
  resume: File | null
  technicalSkills: string[]
  certifications: string[]
  careerInterests: string[]
  workExperience: string[]
  availableForWork: string
}

export default function Home() {
  const router = useRouter()
  const toast = useToast()
  const [activeSection, setActiveSection] = useState<string>('personal')
  const [formData, setFormData] = useState<FormData>({
    fullName: '',
    email: '',
    linkedinUrl: '',
    githubUrl: '',
    shortBio: '',
    resume: null,
    technicalSkills: [],
    certifications: [],
    careerInterests: [],
    workExperience: [],
    availableForWork: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    // Custom validation for technical skills
    if (formData.technicalSkills.length === 0) {
      setErrors({ technicalSkills: 'Please select at least one technical skill.' })
      return
    } else {
      setErrors((prev) => ({ ...prev, technicalSkills: '' }))
    }

    // Custom validation for certifications
    if (formData.certifications.length === 0) {
      setErrors({ certifications: 'Please select at least one certification.' })
      return
    }

    // Custom validation for career interests
    if (formData.careerInterests.length === 0) {
      setErrors({ careerInterests: 'Please select at least one career interest.' })
      return
    }

    // Custom validation for work experience
    if (formData.workExperience.length === 0) {
      setErrors({ workExperience: 'Please select at least one work experience.' })
      return
    }
    setErrors({})

    try {
      const form = new FormData()
      form.append('fullName', formData.fullName)
      form.append('email', formData.email)
      form.append('linkedinUrl', formData.linkedinUrl)
      form.append('githubUrl', formData.githubUrl)
      form.append('shortBio', formData.shortBio)
      if (formData.resume) {
        form.append('resume', formData.resume)
      }
      form.append('availableForWork', formData.availableForWork)
      form.append('technicalSkills', JSON.stringify(formData.technicalSkills))
      form.append('certifications', JSON.stringify(formData.certifications))
      form.append('careerInterests', JSON.stringify(formData.careerInterests))
      form.append('workExperience', JSON.stringify(formData.workExperience))

      const response = await fetch('/api/submit', {
        method: 'POST',
        body: form,
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Success!',
          description: 'Thank you for submitting your profile!',
          status: 'success',
          duration: 5000,
          isClosable: true,
        })
        
        // Redirect to thank you page
        if (data.redirectUrl) {
          router.push(data.redirectUrl)
        }
      } else {
        throw new Error(data.message)
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.'
      toast({
        title: 'Error',
        description: errorMessage,
        status: 'error',
        duration: 5000,
        isClosable: true,
      })
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, resume: e.target.files[0] })
    }
  }

  const sections = [
    {
      id: 'personal',
      title: 'Personal Information',
      description: 'Tell us about yourself',
      fields: (
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Full Name</FormLabel>
            <Input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Email Address</FormLabel>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>LinkedIn URL</FormLabel>
            <Input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>GitHub URL</FormLabel>
            <Input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Short Bio</FormLabel>
            <Textarea
              value={formData.shortBio}
              onChange={(e) => setFormData({ ...formData, shortBio: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>
        </VStack>
      ),
    },
    {
      id: 'resume',
      title: 'Resume Upload',
      description: 'Upload your resume in PDF format',
      fields: (
        <FormControl isRequired>
          <FormLabel>Upload Resume (PDF only, max 10MB)</FormLabel>
          <Input
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            p={1}
            border="2px dashed"
            borderColor="gray.200"
            _hover={{ borderColor: 'blue.500' }}
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
          />
        </FormControl>
      ),
    },
    {
      id: 'skills',
      title: 'Technical Skills & Certifications',
      description: 'Tell us about your technical expertise',
      fields: (
        <VStack spacing={6} align="stretch">
          <FormControl isInvalid={!!errors.technicalSkills}>
            <FormLabel>Technical Skills (Select at least one)</FormLabel>
            <Stack>
              {['HTML', 'CSS', 'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL'].map((skill) => (
                <Checkbox
                  key={skill}
                  isChecked={formData.technicalSkills.includes(skill)}
                  onChange={(e) => {
                    const skills = e.target.checked
                      ? [...formData.technicalSkills, skill]
                      : formData.technicalSkills.filter((s) => s !== skill)
                    setFormData({ ...formData, technicalSkills: skills })
                  }}
                  _hover={{ transform: 'translateX(4px)' }}
                  transition="all 0.2s"
                >
                  {skill}
                </Checkbox>
              ))}
              <Box>
                <Input
                  placeholder="Other skills (press Enter to add)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const value = input.value.trim()
                      if (value && !formData.technicalSkills.includes(value)) {
                        setFormData({
                          ...formData,
                          technicalSkills: [...formData.technicalSkills, value],
                        })
                        input.value = ''
                      }
                    }
                  }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </Box>
              {errors.technicalSkills && (
                <FormErrorMessage>{errors.technicalSkills}</FormErrorMessage>
              )}
              {formData.technicalSkills.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Selected Skills:</Text>
                  <Wrap mt={1}>
                    {formData.technicalSkills.map((skill) => (
                      <WrapItem key={skill}>
                        <Tag
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="blue"
                          cursor="pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              technicalSkills: formData.technicalSkills.filter((s) => s !== skill),
                            })
                          }}
                          _hover={{ transform: 'scale(1.05)' }}
                          transition="all 0.2s"
                        >
                          <TagLabel>{skill}</TagLabel>
                          <TagCloseButton />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </Stack>
          </FormControl>

          <FormControl isInvalid={!!errors.certifications}>
            <FormLabel>Certifications (Select at least one)</FormLabel>
            <Stack>
              {['Scrum', 'AWS', 'Google IT', 'CompTIA', 'None'].map((cert) => (
                <Checkbox
                  key={cert}
                  isChecked={formData.certifications.includes(cert)}
                  onChange={(e) => {
                    const certs = e.target.checked
                      ? [...formData.certifications, cert]
                      : formData.certifications.filter((c) => c !== cert)
                    setFormData({ ...formData, certifications: certs })
                  }}
                  _hover={{ transform: 'translateX(4px)' }}
                  transition="all 0.2s"
                >
                  {cert}
                </Checkbox>
              ))}
              <Box>
                <Input
                  placeholder="Other certifications (press Enter to add)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const value = input.value.trim()
                      if (value && !formData.certifications.includes(value)) {
                        setFormData({
                          ...formData,
                          certifications: [...formData.certifications, value],
                        })
                        input.value = ''
                      }
                    }
                  }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </Box>
              {errors.certifications && (
                <FormErrorMessage>{errors.certifications}</FormErrorMessage>
              )}
              {formData.certifications.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Selected Certifications:</Text>
                  <Wrap mt={1}>
                    {formData.certifications.map((cert) => (
                      <WrapItem key={cert}>
                        <Tag
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="green"
                          cursor="pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              certifications: formData.certifications.filter((c) => c !== cert),
                            })
                          }}
                          _hover={{ transform: 'scale(1.05)' }}
                          transition="all 0.2s"
                        >
                          <TagLabel>{cert}</TagLabel>
                          <TagCloseButton />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </Stack>
          </FormControl>
        </VStack>
      ),
    },
    {
      id: 'career',
      title: 'Career Information',
      description: 'Tell us about your career goals and experience',
      fields: (
        <VStack spacing={6} align="stretch">
          <FormControl isInvalid={!!errors.careerInterests}>
            <FormLabel>Career Interests (Select at least one)</FormLabel>
            <Stack>
              {['Frontend', 'Backend', 'Full Stack', 'Cybersecurity', 'UI/UX', 'QA', 'DevOps'].map((interest) => (
                <Checkbox
                  key={interest}
                  isChecked={formData.careerInterests.includes(interest)}
                  onChange={(e) => {
                    const interests = e.target.checked
                      ? [...formData.careerInterests, interest]
                      : formData.careerInterests.filter((i) => i !== interest)
                    setFormData({ ...formData, careerInterests: interests })
                  }}
                  _hover={{ transform: 'translateX(4px)' }}
                  transition="all 0.2s"
                >
                  {interest}
                </Checkbox>
              ))}
              <Box>
                <Input
                  placeholder="Other interests (press Enter to add)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const value = input.value.trim()
                      if (value && !formData.careerInterests.includes(value)) {
                        setFormData({
                          ...formData,
                          careerInterests: [...formData.careerInterests, value],
                        })
                        input.value = ''
                      }
                    }
                  }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </Box>
              {errors.careerInterests && (
                <FormErrorMessage>{errors.careerInterests}</FormErrorMessage>
              )}
              {formData.careerInterests.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Selected Interests:</Text>
                  <Wrap mt={1}>
                    {formData.careerInterests.map((interest) => (
                      <WrapItem key={interest}>
                        <Tag
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="purple"
                          cursor="pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              careerInterests: formData.careerInterests.filter((i) => i !== interest),
                            })
                          }}
                          _hover={{ transform: 'scale(1.05)' }}
                          transition="all 0.2s"
                        >
                          <TagLabel>{interest}</TagLabel>
                          <TagCloseButton />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </Stack>
          </FormControl>

          <FormControl isInvalid={!!errors.workExperience}>
            <FormLabel>Past Work Experience (Select at least one)</FormLabel>
            <Stack>
              {[
                'Marketing',
                'Retail',
                'Customer Service',
                'Education',
                'Healthcare',
                'Military',
                'Tech Support',
                'Freelance',
              ].map((exp) => (
                <Checkbox
                  key={exp}
                  isChecked={formData.workExperience.includes(exp)}
                  onChange={(e) => {
                    const experiences = e.target.checked
                      ? [...formData.workExperience, exp]
                      : formData.workExperience.filter((w) => w !== exp)
                    setFormData({ ...formData, workExperience: experiences })
                  }}
                  _hover={{ transform: 'translateX(4px)' }}
                  transition="all 0.2s"
                >
                  {exp}
                </Checkbox>
              ))}
              <Box>
                <Input
                  placeholder="Other experience (press Enter to add)"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      const input = e.target as HTMLInputElement
                      const value = input.value.trim()
                      if (value && !formData.workExperience.includes(value)) {
                        setFormData({
                          ...formData,
                          workExperience: [...formData.workExperience, value],
                        })
                        input.value = ''
                      }
                    }
                  }}
                  _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
                />
              </Box>
              {errors.workExperience && (
                <FormErrorMessage>{errors.workExperience}</FormErrorMessage>
              )}
              {formData.workExperience.length > 0 && (
                <Box mt={2}>
                  <Text fontSize="sm" fontWeight="bold">Selected Experience:</Text>
                  <Wrap mt={1}>
                    {formData.workExperience.map((exp) => (
                      <WrapItem key={exp}>
                        <Tag
                          size="md"
                          borderRadius="full"
                          variant="solid"
                          colorScheme="orange"
                          cursor="pointer"
                          onClick={() => {
                            setFormData({
                              ...formData,
                              workExperience: formData.workExperience.filter((w) => w !== exp),
                            })
                          }}
                          _hover={{ transform: 'scale(1.05)' }}
                          transition="all 0.2s"
                        >
                          <TagLabel>{exp}</TagLabel>
                          <TagCloseButton />
                        </Tag>
                      </WrapItem>
                    ))}
                  </Wrap>
                </Box>
              )}
            </Stack>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Currently Available for Work?</FormLabel>
            <RadioGroup
              value={formData.availableForWork}
              onChange={(value) => setFormData({ ...formData, availableForWork: value })}
            >
              <Stack direction="row" spacing={8}>
                <Radio value="yes" _hover={{ transform: 'scale(1.05)' }} transition="all 0.2s">
                  Yes
                </Radio>
                <Radio value="no" _hover={{ transform: 'scale(1.05)' }} transition="all 0.2s">
                  No
                </Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </VStack>
      ),
    },
  ]

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={10}>
          <Heading
            as="h1"
            size="2xl"
            fontWeight="800"
            letterSpacing="tight"
            color="gray.900"
            fontFamily="'Inter', sans-serif"
            position="relative"
            _after={{
              content: '""',
              position: 'absolute',
              bottom: '-10px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '4px',
              bg: 'blue.500',
              borderRadius: 'full',
            }}
          >
            Student LookBook Form
          </Heading>
          <Text
            mt={4}
            fontSize="lg"
            color="gray.600"
            fontFamily="'Inter', sans-serif"
          >
            Showcase your skills and experience
          </Text>
        </Box>

        <form onSubmit={handleSubmit}>
          <Accordion allowMultiple defaultIndex={[0]}>
            {sections.map((section) => (
              <AccordionItem
                key={section.id}
                border="1px solid"
                borderColor="gray.200"
                borderRadius="lg"
                mb={4}
                _hover={{ borderColor: 'blue.500' }}
                transition="all 0.2s"
              >
                <AccordionButton
                  py={4}
                  _hover={{ bg: 'gray.50' }}
                  _expanded={{ bg: 'blue.50', color: 'blue.600' }}
                >
                  <Box flex="1" textAlign="left">
                    <Heading size="md">{section.title}</Heading>
                    <Text fontSize="sm" color="gray.500">
                      {section.description}
                    </Text>
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
                <AccordionPanel pb={4}>
                  <ScaleFade in={true} initialScale={0.95}>
                    {section.fields}
                  </ScaleFade>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            mt={8}
            w="full"
            _hover={{
              transform: 'translateY(-2px)',
              boxShadow: 'lg',
            }}
            transition="all 0.2s"
          >
            Submit Profile
          </Button>
        </form>
      </VStack>
    </Container>
  )
} 