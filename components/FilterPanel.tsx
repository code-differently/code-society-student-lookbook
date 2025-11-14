import React, { useState, useEffect } from 'react'
import { EducationOptions } from '@/filters/EducationOptions'
import { FieldOfStudyOptions } from '@/filters/FieldOfStudyOptions'
import { SkillCategories } from '@/filters/SkillCategories'
import { CertificationOptions } from '@/filters/CertificationOptions'
import { CareerInterestOptions } from '@/filters/CareerInterestOptions'
import { WorkExperienceOptions } from '@/filters/WorkExperienceOptions'
import {
  Box,
  VStack,
  HStack,
  Input,
  Select,
  Button,
  Text,
  Badge,
  Wrap,
  WrapItem,
  useDisclosure,
  Collapse,
  IconButton,
  Divider,
  useColorModeValue,
  FormControl,
  FormLabel,
  InputGroup,
  InputLeftElement,
  Checkbox,
  Switch,
  Drawer,
  DrawerOverlay,
  DrawerContent,
  DrawerHeader,
  DrawerBody,
  DrawerCloseButton,
  useBreakpointValue,
  SimpleGrid,
  Stack,
  Spacer,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Flex,
  Tooltip,
  Icon,
  RadioGroup,
  Radio,
} from '@chakra-ui/react'
import { 
  ChevronDownIcon, 
  ChevronUpIcon, 
  SearchIcon, 
  HamburgerIcon,
  CloseIcon,
  CheckIcon,
} from '@chakra-ui/icons'

interface FilterPanelProps {
  onFiltersChange: (filters: FilterState) => void
  isLoading?: boolean
}

export interface FilterState {
  search: string
  skills: string[]
  certifications: string[]
  interests: string[]
  workExperience: string[]
  veteran: string
  dateFrom: string
  dateTo: string
  sortBy: string
  skillCombination: 'any' | 'all' | 'exact'
  minSkills: number
  maxSkills: number
  hasAnyCertification: boolean
  hasWorkExperience: boolean
  profileCompleteness: 'any' | 'complete' | 'partial'
  skillLevel: 'any' | 'beginner' | 'intermediate' | 'advanced'
  certificationLevel: 'any' | 'entry' | 'professional' | 'expert'
  yearsOfExperience?: string[]
  yearsOfTechExperience?: string[]
  educationDegrees?: string[]
  educationField?: string
}

interface AvailableTags {
  skills: string[]
  certifications: string[]
  interests: string[]
  workExperience: string[]
}

const sortOptions = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
]

const FilterPanel: React.FC<FilterPanelProps> = ({ onFiltersChange, isLoading = false }) => {
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    skills: [],
    certifications: [],
    interests: [],
    workExperience: [],
    veteran: '',
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
    yearsOfTechExperience: [],
    educationDegrees: [],
    educationField: '',
  })

  // Flatten skills from categories for the filter options
  const allSkills = Object.values(SkillCategories).flat()

  const [availableTags] = useState<AvailableTags>({
    skills: allSkills,
    certifications: CertificationOptions,
    interests: CareerInterestOptions,
    workExperience: WorkExperienceOptions
  })

  const [loadingTags] = useState(false) // No longer loading since we use static data
  const { isOpen, onToggle, onOpen, onClose } = useDisclosure()
  const cardBg = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const isMobile = useBreakpointValue({ base: true, md: false })

  useEffect(() => {
    onFiltersChange(filters)
  }, [filters, onFiltersChange])

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const clearFilters = () => {
    setFilters({
      search: '',
      skills: [],
      certifications: [],
      interests: [],
      workExperience: [],
      veteran: '',
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
      yearsOfTechExperience: [],
      educationDegrees: [],
      educationField: '',
    })
  }

  const hasActiveFilters = filters.search || 
    filters.skills.length > 0 || 
    filters.certifications.length > 0 || 
    filters.interests.length > 0 || 
    filters.workExperience.length > 0 || 
    filters.dateFrom || 
    filters.dateTo ||
    filters.sortBy !== 'newest'

  // Modern Multi-select Component
  const MultiSelect = ({
    options,
    value,
    onChange,
    placeholder,
    colorScheme,
    label
  }: {
    options: string[]
    value: string[]
    onChange: (val: string[]) => void
    placeholder: string
    colorScheme: string
    label: string
  }) => (
    <FormControl>
      <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
        {label}
      </FormLabel>
      <Menu closeOnSelect={false}>
        <MenuButton 
          as={Button} 
          rightIcon={<ChevronDownIcon />} 
          w="100%" 
          size="md" 
          variant="outline"
          bg="white"
          borderColor="gray.300"
          _hover={{ borderColor: 'gray.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
        >
          {value.length > 0 ? `${value.length} selected` : placeholder}
        </MenuButton>
        <MenuList maxH="250px" overflowY="auto" bg="white" border="1px solid" borderColor="gray.200" boxShadow="lg">
          {options.map(option => (
            <MenuItem key={option} bg="transparent" _hover={{ bg: 'gray.50' }}>
              <Checkbox
                colorScheme={colorScheme}
                isChecked={value.includes(option)}
                onChange={e => {
                  if (e.target.checked) {
                    onChange([...value, option])
                  } else {
                    onChange(value.filter(v => v !== option))
                  }
                }}
                mr={3}
              >
                {option}
              </Checkbox>
            </MenuItem>
          ))}
        </MenuList>
      </Menu>
      {value.length > 0 && (
        <Wrap mt={3} spacing={2}>
          {value.map(val => (
            <WrapItem key={val}>
              <Badge
                colorScheme={colorScheme}
                variant="solid"
                cursor="pointer"
                onClick={() => onChange(value.filter(v => v !== val))}
                px={2}
                py={1}
                borderRadius="md"
                fontSize="xs"
                _hover={{ opacity: 0.8 }}
              >
                {val}
                <Icon as={CloseIcon} ml={1} boxSize={3} />
              </Badge>
            </WrapItem>
          ))}
        </Wrap>
      )}
    </FormControl>
  )

  const filterContent = (
    <VStack spacing={6} align="stretch">
      {/* Header */}
      <Flex justify="space-between" align="center" pb={4}>
        <HStack spacing={3}>
          <Icon as={SearchIcon} color="blue.600" boxSize={5} />
          <Heading size="md" fontWeight="600" color="gray.800">
            Filters
          </Heading>
          {hasActiveFilters && (
            <Badge colorScheme="blue" variant="subtle" fontSize="xs" px={2} py={1}>
              {filters.skills.length + filters.certifications.length + filters.interests.length + filters.workExperience.length} active
            </Badge>
          )}
        </HStack>
        {hasActiveFilters && (
          <Button
            size="sm"
            variant="ghost"
            onClick={clearFilters}
            color="gray.600"
            _hover={{ bg: 'gray.100' }}
            leftIcon={<CloseIcon boxSize={3} />}
          >
            Clear
          </Button>
        )}
      </Flex>

      <Divider />

      {/* Search */}
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
          Search
        </FormLabel>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.400" boxSize={4} />
          </InputLeftElement>
          <Input
            placeholder="Search by name, email, or statement..."
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            size="md"
            bg="white"
            borderColor="gray.300"
            _hover={{ borderColor: 'gray.400' }}
            _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
          />
        </InputGroup>
      </FormControl>

      {/* Sort By */}
      <FormControl>
        <FormLabel fontSize="sm" fontWeight="500" color="gray.700" mb={2}>
          Sort By
        </FormLabel>
        <Select
          value={filters.sortBy}
          onChange={e => updateFilter('sortBy', e.target.value)}
          size="md"
          bg="white"
          borderColor="gray.300"
          _hover={{ borderColor: 'gray.400' }}
          _focus={{ borderColor: 'blue.500', boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)' }}
        >
          {sortOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
      </FormControl>

      {/* Date Range */}
      <Card variant="outline" borderColor="gray.200" bg="gray.50">
        <CardBody py={4}>
          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={3}>
            Date Range
          </Text>
          <SimpleGrid columns={2} spacing={3}>
            <FormControl>
              <FormLabel fontSize="xs" color="gray.600" mb={1}>
                From
              </FormLabel>
              <Input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => updateFilter('dateFrom', e.target.value)}
                size="sm"
                bg="white"
                borderColor="gray.300"
              />
            </FormControl>
            <FormControl>
              <FormLabel fontSize="xs" color="gray.600" mb={1}>
                To
              </FormLabel>
              <Input
                type="date"
                value={filters.dateTo}
                onChange={(e) => updateFilter('dateTo', e.target.value)}
                size="sm"
                bg="white"
                borderColor="gray.300"
              />
            </FormControl>
          </SimpleGrid>
        </CardBody>
      </Card>

      {/* Skills */}
      <FormControl mb={2}>
        <FormLabel>Veteran Status</FormLabel>
        <Select
          placeholder="Select veteran status"
          value={filters.veteran || ''}
          onChange={e => updateFilter('veteran', e.target.value)}
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </Select>
      </FormControl>

      <MultiSelect
        options={availableTags.skills}
        value={filters.skills}
        onChange={val => updateFilter('skills', val)}
        placeholder="Select technical skills..."
        colorScheme="blue"
        label="Technical Skills"
      />

      {/* Certifications */}
      <MultiSelect
        options={availableTags.certifications}
        value={filters.certifications}
        onChange={val => updateFilter('certifications', val)}
        placeholder="Select certifications..."
        colorScheme="green"
        label="Certifications"
      />

      {/* Career Interests */}
      <MultiSelect
        options={availableTags.interests}
        value={filters.interests}
        onChange={val => updateFilter('interests', val)}
        placeholder="Select career interests..."
        colorScheme="purple"
        label="Career Interests"
      />

      {/* Work Experience */}
      <MultiSelect
        options={availableTags.workExperience}
        value={filters.workExperience}
        onChange={val => updateFilter('workExperience', val)}
        placeholder="Select work experience..."
        colorScheme="orange"
        label="Work Experience"
      />

      {/* Education Background */}
      <MultiSelect
        options={EducationOptions}
        value={filters.educationDegrees || []}
        onChange={val => updateFilter('educationDegrees', val)}
        placeholder="Select education background..."
        colorScheme="teal"
        label="Education Background"
      />

      {/* Field of Study */}
      <FormControl mb={2}>
        <FormLabel>Field of Study</FormLabel>
        <Select
          placeholder="Any field of study"
          value={filters.educationField || ''}
          onChange={e => updateFilter('educationField', e.target.value)}
        >
          {FieldOfStudyOptions.map((field) => (
            <option key={field} value={field}>
              {field}
            </option>
          ))}
        </Select>
      </FormControl>

      {/* Additional Filters */}
      <MultiSelect
        options={['0-3', '4-7', '8+']}
        value={filters.yearsOfExperience || []}
        onChange={val => updateFilter('yearsOfExperience', val)}
        placeholder="Select years of experience..."
        colorScheme="cyan"
        label="Years of Experience"
      />

      <MultiSelect
        options={['0-3', '4-7', '8+']}
        value={filters.yearsOfTechExperience || []}
        onChange={val => updateFilter('yearsOfTechExperience', val)}
        placeholder="Select years of technical experience..."
        colorScheme="cyan"
        label="Years of Technical Experience"
      />

      {/* Advanced Filters */}
      <Card variant="outline" borderColor="gray.200" bg="gray.50">
        <CardBody py={4}>
          <Text fontSize="sm" fontWeight="500" color="gray.700" mb={3}>
            Advanced Filters
          </Text>
          <VStack spacing={4} align="stretch">
            
            {/* Skill Combination Logic */}
            {filters.skills.length > 1 && (
              <FormControl>
                <FormLabel fontSize="xs" color="gray.600" mb={1}>
                  Skill Combination
                </FormLabel>
                <RadioGroup value={filters.skillCombination} onChange={val => updateFilter('skillCombination', val)}>
                  <Stack direction="row" spacing={4}>
                    <Radio value="any" size="sm">Any</Radio>
                    <Radio value="all" size="sm">All</Radio>
                    <Radio value="exact" size="sm">Exact</Radio>
                  </Stack>
                </RadioGroup>
                <Text fontSize="xs" color="gray.500" mt={1}>
                  Any: Has any of the selected skills | All: Has all selected skills | Exact: Has exactly these skills
                </Text>
              </FormControl>
            )}

            {/* Skill Count Range */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.600" mb={1}>
                Skill Count Range
              </FormLabel>
              <SimpleGrid columns={2} spacing={3}>
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.minSkills || ''}
                  onChange={e => updateFilter('minSkills', parseInt(e.target.value) || 0)}
                  size="sm"
                  bg="white"
                  borderColor="gray.300"
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.maxSkills || ''}
                  onChange={e => updateFilter('maxSkills', parseInt(e.target.value) || 0)}
                  size="sm"
                  bg="white"
                  borderColor="gray.300"
                />
              </SimpleGrid>
            </FormControl>

            {/* Additional Toggles */}
            <SimpleGrid columns={1} spacing={3}>
              <FormControl display="flex" alignItems="center">
                <Switch
                  id="hasAnyCertification"
                  isChecked={filters.hasAnyCertification}
                  onChange={e => updateFilter('hasAnyCertification', e.target.checked)}
                  colorScheme="green"
                  mr={3}
                />
                <FormLabel htmlFor="hasAnyCertification" mb="0" fontSize="sm" color="gray.600">
                  Has Any Certification
                </FormLabel>
              </FormControl>
              
              <FormControl display="flex" alignItems="center">
                <Switch
                  id="hasWorkExperience"
                  isChecked={filters.hasWorkExperience}
                  onChange={e => updateFilter('hasWorkExperience', e.target.checked)}
                  colorScheme="orange"
                  mr={3}
                />
                <FormLabel htmlFor="hasWorkExperience" mb="0" fontSize="sm" color="gray.600">
                  Has Work Experience
                </FormLabel>
              </FormControl>
            </SimpleGrid>

            {/* Profile Completeness */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.600" mb={1}>
                Profile Completeness
              </FormLabel>
              <Select
                value={filters.profileCompleteness}
                onChange={e => updateFilter('profileCompleteness', e.target.value)}
                size="sm"
                bg="white"
                borderColor="gray.300"
              >
                <option value="any">Any Profile</option>
                <option value="complete">Complete Profiles Only</option>
                <option value="partial">Partial Profiles</option>
              </Select>
            </FormControl>

            {/* Skill Level */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.600" mb={1}>
                Skill Level
              </FormLabel>
              <Select
                value={filters.skillLevel}
                onChange={e => updateFilter('skillLevel', e.target.value)}
                size="sm"
                bg="white"
                borderColor="gray.300"
              >
                <option value="any">Any Level</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </Select>
            </FormControl>

            {/* Certification Level */}
            <FormControl>
              <FormLabel fontSize="xs" color="gray.600" mb={1}>
                Certification Level
              </FormLabel>
              <Select
                value={filters.certificationLevel}
                onChange={e => updateFilter('certificationLevel', e.target.value)}
                size="sm"
                bg="white"
                borderColor="gray.300"
              >
                <option value="any">Any Level</option>
                <option value="entry">Entry Level</option>
                <option value="professional">Professional</option>
                <option value="expert">Expert Level</option>
              </Select>
            </FormControl>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  )

  // Responsive: sidebar on desktop, drawer on mobile
  if (isMobile) {
    return (
      <Box mb={4}>
        <Button 
          leftIcon={<HamburgerIcon />} 
          onClick={onOpen} 
          colorScheme="blue" 
          w="full" 
          mb={2}
          size="lg"
          bg="blue.600"
          _hover={{ bg: 'blue.700' }}
        >
          Filters
          {hasActiveFilters && (
            <Badge ml={2} colorScheme="white" variant="solid" fontSize="xs">
              {filters.skills.length + filters.certifications.length + filters.interests.length + filters.workExperience.length}
            </Badge>
          )}
        </Button>
        <Drawer isOpen={isOpen} placement="left" onClose={onClose} size="sm">
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader borderBottom="1px solid" borderColor="gray.200">
              Filter Candidates
            </DrawerHeader>
            <DrawerBody p={6}>
              {filterContent}
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </Box>
    )
  }

  return (
    <Box
      as="aside"
      bg={cardBg}
      border="1px solid"
      borderColor={borderColor}
      borderRadius="xl"
      p={6}
      minW="320px"
      maxW="380px"
      boxShadow="lg"
      position="sticky"
      top="24px"
      alignSelf="flex-start"
      h="fit-content"
      maxH="calc(100vh - 48px)"
      overflowY="auto"
    >
      {filterContent}
    </Box>
  )
}

export default FilterPanel 