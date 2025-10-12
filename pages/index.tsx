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
  Select,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from '@chakra-ui/react'
import { ChevronDownIcon } from '@chakra-ui/icons'
import { StudentFormData } from '@/interfaces/StudentFormData'
import { EducationOptions } from '@/filters/EducationOptions'
import { FieldOfStudyOptions } from '@/filters/FieldOfStudyOptions'
import { SkillCategories } from '@/filters/SkillCategories'
import { CertificationOptions } from '@/filters/CertificationOptions'
import { CareerInterestOptions } from '@/filters/CareerInterestOptions'
import { WorkExperienceOptions } from '@/filters/WorkExperienceOptions'

export default function Home() {
  const router = useRouter()
  const toast = useToast()
  const [activeSection, setActiveSection] = useState<string>('personal')

  const [formData, setFormData] = useState<StudentFormData>({
    fullName: '',
    email: '',
    linkedinUrl: '',
    githubUrl: '',
    resume: null,
    headshot: null,
    technicalSkills: [],
    certifications: [],
    careerInterests: [],
    workExperience: [],
    yearsOfExperience: '',
    educationDegree: [],
    educationField: '',
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
      if (formData.resume) {
        form.append('resume', formData.resume)
      }
      if (formData.headshot) {
        form.append('headshot', formData.headshot)
      }
      form.append('technicalSkills', JSON.stringify(formData.technicalSkills))
      form.append('yearsOfExperience', formData.yearsOfExperience)
      form.append('educationDegree', JSON.stringify(formData.educationDegree))
      form.append('educationField', formData.educationField)
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
      
      // Check if it's a file upload error and navigate to the appropriate section
      if (errorMessage.includes('Resume must be a PDF') || errorMessage.includes('resume')) {
        setActiveSection('resume')
        toast({
          title: 'Resume Upload Error',
          description: errorMessage,
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top',
        })
      } else if (errorMessage.includes('Headshot must be an image') || errorMessage.includes('headshot')) {
        setActiveSection('personal')
        toast({
          title: 'Headshot Upload Error',
          description: errorMessage,
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top',
        })
      } else if (errorMessage.includes('File size exceeds')) {
        toast({
          title: 'File Size Error',
          description: errorMessage,
          status: 'error',
          duration: 8000,
          isClosable: true,
          position: 'top',
        })
      } else {
        toast({
          title: 'Error',
          description: errorMessage,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
      }
    }
  }

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'resume' | 'headshot') => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, [type]: e.target.files[0] })
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

          <FormControl isRequired>
            <FormLabel>LinkedIn URL</FormLabel>
            <Input
              type="url"
              value={formData.linkedinUrl}
              onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>GitHub URL</FormLabel>
            <Input
              type="url"
              value={formData.githubUrl}
              onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Upload Headshot (JPG, PNG, max 10MB)</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => handleFileChange(e, 'headshot')}
              p={1}
              border="2px dashed"
              borderColor="gray.200"
              _hover={{ borderColor: 'blue.500' }}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            />
            <Text fontSize="sm" color="gray.500" mt={1}>
              Supported formats: JPG, PNG, GIF. Maximum file size: 10MB
            </Text>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Education Background (Select all that apply)</FormLabel>
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                textAlign="left"
                fontWeight="normal"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                {formData.educationDegree.length > 0 
                  ? `${formData.educationDegree.length} selected` 
                  : 'Select education background'}
              </MenuButton>
              <MenuList maxHeight="200px" overflowY="auto">
                <MenuOptionGroup type="checkbox">
                  {EducationOptions.map((option) => (
                    <MenuItemOption
                      key={option}
                      value={option}
                      isChecked={formData.educationDegree.includes(option)}
                      onClick={() => {
                        const degrees = formData.educationDegree.includes(option)
                          ? formData.educationDegree.filter(d => d !== option)
                          : [...formData.educationDegree, option]
                        setFormData({ ...formData, educationDegree: degrees })
                      }}
                    >
                      {option}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            {formData.educationDegree.length > 0 && (
              <Box mt={2}>
                <Text fontSize="sm" fontWeight="bold">Selected Education:</Text>
                <Wrap mt={1}>
                  {formData.educationDegree.map((degree) => (
                    <WrapItem key={degree}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="teal"
                        cursor="pointer"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            educationDegree: formData.educationDegree.filter((d) => d !== degree),
                          })
                        }}
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        <TagLabel>{degree}</TagLabel>
                        <TagCloseButton />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Field of Study</FormLabel>
            <Select
              placeholder="Select your field of study"
              value={formData.educationField}
              onChange={e => setFormData({ ...formData, educationField: e.target.value })}
              _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
            >
              {FieldOfStudyOptions.map((field) => (
                <option key={field} value={field}>
                  {field}
                </option>
              ))}
            </Select>
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
            onChange={(e) => handleFileChange(e, 'resume')}
            p={1}
            border="2px dashed"
            borderColor="gray.200"
            _hover={{ borderColor: 'blue.500' }}
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
          />
          <Text fontSize="sm" color="gray.500" mt={1}>
            PDF format only. Maximum file size: 10MB
          </Text>
        </FormControl>
      ),
    },
    {
      id: 'skills',
      title: 'Technical Skills & Certifications',
      description: 'Tell us about your technical expertise',
      fields: (
        <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
          <VStack spacing={6} align="stretch">
          <FormControl isInvalid={!!errors.technicalSkills}>
            <FormLabel>Technical Skills (Select at least one)</FormLabel>
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                textAlign="left"
                fontWeight="normal"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                {formData.technicalSkills.length > 0 
                  ? `${formData.technicalSkills.length} skills selected` 
                  : 'Select technical skills'}
              </MenuButton>
              <MenuList maxHeight="300px" overflowY="auto">
                {Object.entries(SkillCategories).map(([category, skills]) => (
                  <MenuGroup key={category} title={category}>
                    {skills.map((skill) => (
                      <MenuItemOption
                        key={skill}
                        value={skill}
                        isChecked={formData.technicalSkills.includes(skill)}
                        onClick={() => {
                          const updatedSkills = formData.technicalSkills.includes(skill)
                            ? formData.technicalSkills.filter(s => s !== skill)
                            : [...formData.technicalSkills, skill]
                          setFormData({ ...formData, technicalSkills: updatedSkills })
                        }}
                      >
                        {skill}
                      </MenuItemOption>
                    ))}
                    <MenuDivider />
                  </MenuGroup>
                ))}
              </MenuList>
            </Menu>
            <Box mt={2}>
              <Input
                placeholder="Add custom skill (press Enter)"
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
          </FormControl>

          <FormControl isInvalid={!!errors.certifications}>
            <FormLabel>Certifications (Select at least one)</FormLabel>
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                textAlign="left"
                fontWeight="normal"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                {formData.certifications.length > 0 
                  ? `${formData.certifications.length} certifications selected` 
                  : 'Select certifications'}
              </MenuButton>
              <MenuList maxHeight="300px" overflowY="auto">
                <MenuOptionGroup type="checkbox">
                  {CertificationOptions.map((cert) => (
                    <MenuItemOption
                      key={cert}
                      value={cert}
                      isChecked={formData.certifications.some(c => c.name === cert)}
                      onClick={() => {
                        const certs = formData.certifications.some(c => c.name === cert)
                          ? formData.certifications.filter((c) => c.name !== cert)
                          : [...formData.certifications, { name: cert, status: 'Completed' }]
                        setFormData({ ...formData, certifications: certs })
                      }}
                    >
                      {cert}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Box mt={2}>
              <Input
                placeholder="Add custom certification (press Enter)"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    const value = input.value.trim()
                    if (value && !formData.certifications.some(c => c.name === value)) {
                      setFormData({
                        ...formData,
                        certifications: [...formData.certifications, { name: value, status: 'Completed' }],
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
                    <WrapItem key={cert.name}>
                      <Tag
                        size="md"
                        borderRadius="full"
                        variant="solid"
                        colorScheme="green"
                        cursor="pointer"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            certifications: formData.certifications.filter((c) => c.name !== cert.name),
                          })
                        }}
                        _hover={{ transform: 'scale(1.05)' }}
                        transition="all 0.2s"
                      >
                        <TagLabel>{cert.name}</TagLabel>
                        <TagCloseButton />
                      </Tag>
                    </WrapItem>
                  ))}
                </Wrap>
              </Box>
            )}
          </FormControl>
        </VStack>
        </Box>
      ),
    },
    {
      id: 'career',
      title: 'Career Information',
      description: 'Tell us about your career goals and experience',
      fields: (
        <Box p={4} bg="gray.50" borderRadius="md" border="1px solid" borderColor="gray.100">
          <VStack spacing={6} align="stretch">
          <FormControl isInvalid={!!errors.careerInterests}>
            <FormLabel>Career Interests (Select at least one)</FormLabel>
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                textAlign="left"
                fontWeight="normal"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                {formData.careerInterests.length > 0 
                  ? `${formData.careerInterests.length} interests selected` 
                  : 'Select career interests'}
              </MenuButton>
              <MenuList maxHeight="300px" overflowY="auto">
                <MenuOptionGroup type="checkbox">
                  {CareerInterestOptions.map((interest) => (
                    <MenuItemOption
                      key={interest}
                      value={interest}
                      isChecked={formData.careerInterests.includes(interest)}
                      onClick={() => {
                        const interests = formData.careerInterests.includes(interest)
                          ? formData.careerInterests.filter((i) => i !== interest)
                          : [...formData.careerInterests, interest]
                        setFormData({ ...formData, careerInterests: interests })
                      }}
                    >
                      {interest}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Box mt={2}>
              <Input
                placeholder="Add custom interest (press Enter)"
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
          </FormControl>

          <FormControl isInvalid={!!errors.workExperience}>
            <FormLabel>Past Work Experience (Select at least one)</FormLabel>
            <Menu closeOnSelect={false}>
              <MenuButton
                as={Button}
                rightIcon={<ChevronDownIcon />}
                width="100%"
                textAlign="left"
                fontWeight="normal"
                bg="white"
                border="1px solid"
                borderColor="gray.200"
                _hover={{ borderColor: 'blue.500' }}
                _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
              >
                {formData.workExperience.length > 0 
                  ? `${formData.workExperience.length} experiences selected` 
                  : 'Select work experience'}
              </MenuButton>
              <MenuList maxHeight="300px" overflowY="auto">
                <MenuOptionGroup type="checkbox">
                  {WorkExperienceOptions.map((exp) => (
                    <MenuItemOption
                      key={exp}
                      value={exp}
                      isChecked={formData.workExperience.includes(exp)}
                      onClick={() => {
                        const experiences = formData.workExperience.includes(exp)
                          ? formData.workExperience.filter((w) => w !== exp)
                          : [...formData.workExperience, exp]
                        setFormData({ ...formData, workExperience: experiences })
                      }}
                    >
                      {exp}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
            <Box mt={2}>
              <Input
                placeholder="Add custom experience (press Enter)"
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
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Years of Professional Experience</FormLabel>
            <RadioGroup
              value={formData.yearsOfExperience}
              onChange={val => setFormData({ ...formData, yearsOfExperience: val })}
            >
              <Stack direction="row">
                <Radio value="0-3">0-3 years</Radio>
                <Radio value="4-7">4-7 years</Radio>
                <Radio value="8+">8+ years</Radio>
              </Stack>
            </RadioGroup>
          </FormControl>
        </VStack>
        </Box>
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