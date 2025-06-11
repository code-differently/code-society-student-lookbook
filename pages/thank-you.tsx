import { useRouter } from 'next/router'
import Head from 'next/head'
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  useColorModeValue,
  Icon,
  Flex,
} from '@chakra-ui/react'
import { CheckCircleIcon } from '@chakra-ui/icons'

export default function ThankYou() {
  const router = useRouter()
  const bgColor = useColorModeValue('gray.50', 'gray.800')
  const cardBg = useColorModeValue('white', 'gray.700')

  return (
    <>
      <Head>
        <title>Thank You - Student Form Submission</title>
        <meta name="description" content="Thank you for submitting your student information" />
      </Head>

      <Box minH="100vh" bg={bgColor} py={20}>
        <Container maxW="container.md">
          <VStack
            spacing={8}
            bg={cardBg}
            p={8}
            borderRadius="xl"
            boxShadow="xl"
            textAlign="center"
          >
            <Flex
              w={20}
              h={20}
              align="center"
              justify="center"
              color="green.500"
              rounded="full"
              bg="green.50"
            >
              <Icon as={CheckCircleIcon} w={10} h={10} />
            </Flex>

            <VStack spacing={4}>
              <Heading
                as="h1"
                size="2xl"
                bgGradient="linear(to-r, blue.400, blue.600)"
                bgClip="text"
                fontWeight="extrabold"
              >
                Thank You!
              </Heading>
              
              <Text fontSize="xl" color="gray.600">
                Your profile has been successfully submitted.
              </Text>
              
              <Text fontSize="md" color="gray.500" maxW="md">
                We appreciate your interest and will review your submission shortly. 
                Our team will get back to you if we need any additional information.
              </Text>
            </VStack>

            <Button
              size="lg"
              colorScheme="blue"
              onClick={() => router.push('/')}
              px={8}
              _hover={{
                transform: 'translateY(-2px)',
                boxShadow: 'lg',
              }}
              transition="all 0.2s"
            >
              Return to Home
            </Button>
          </VStack>
        </Container>
      </Box>
    </>
  )
} 