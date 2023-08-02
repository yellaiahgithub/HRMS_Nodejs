/*
 * DO NOT use hard coded error id in source code
 */
module.exports = {
  ErrorDocumentNotFound: {
    id: 'ErrorDocumentNotFound',
    description: 'Failed to locate a document in Mongo DB.'
  },
  ErrorDocumentReadFailure: {
    id: 'ErrorDocumentReadFailure',
    description: 'Failed to read a document in Mongo DB.'
  },
  ErrorDocumentWriteFailure: {
    id: 'ErrorDocumentWriteFailure',
    description: 'Failed to create or update a document in Mongo DB.'
  },
  ErrorDocumentDeleteFailure: {
    id: 'ErrorDocumentDeleteFailure',
    description: 'Failed to delete a document in Mongo DB.'
  },
  ErrorDocumentInvalid: {
    id: 'ErrorDocumentInvalid',
    description: 'Document from Mongo DB has an invalid format.'
  },
  ErrorFileNotFound: {
    id: 'ErrorFileNotFound',
    description: 'Failed to locate a file on the S3 bucket.'
  },
  ErrorInvalidFileFormat: {
    id: 'ErrorInvalidFileFormat',
    description: 'Format of a file on the S3 bucket is invalid.'
  },
  ErrorConnectionTimeout: {
    id: 'ErrorConnectionTimeout',
    description: 'Failed to connect to a remote host.'
  },
  ErrorRemoteHostError: {
    id: 'ErrorRemoteHostError',
    description: 'Received an error from a remote host.'
  },
  ErrorBadRequest: {
    id: 'ErrorBadRequest',
    description: 'Failed to make request to certain web service'
  },
  ErrorInvalidURI: {
    id: 'ErrorInvalidURI',
    description: 'URI specified in API request is invalid.'
  },
  ErrorSessionExpired: {
    id: 'ErrorSessionExpired',
    description:
      'Session used by the Magellan client is expired. User must log out and log back in.'
  },
  ErrorUnknownSession: {
    id: 'ErrorUnknownSession',
    description:
      'Session used by the Magellan client cannot be found. User must log out and log back in.'
  },
  ErrorSessionCreateFailure: {
    id: 'ErrorSessionCreateFailure',
    description: 'Failed to create a session record for the user'
  },
  ErrorOutOfMemory: {
    id: 'ErrorOutOfMemory',
    description: 'Cannot allocate memory to complete the operation.'
  },
  ErrorInvalidResourceId: {
    id: 'ErrorInvalidResourceId',
    description:
      'User assigned an invalid ID to a resource (for example, node name is 3 characters).'
  },
  ErrorDuplicateResourceId: {
    id: 'ErrorDuplicateResourceId',
    description: 'User assigned a unique ID to a resource which duplicates an existing ID.'
  },
  ErrorInvalidResourceData: {
    id: 'ErrorInvalidResourceData',
    description:
      'A field for a resource has an invalid value (for example, wavelength has invalid value such as 10 nm)'
  },
  ErrorMissingResourceData: {
    id: 'ErrorMissingResourceData',
    description:
      'A required field for a resource has not been specified (for example, missing pole geo location)'
  },
  ErrorInternalServerError: {
    id: 'ErrorInternalServerError',
    description: 'Programming error. This is likely the result of a bug or unhandled condition.'
  },
  ErrorUnprocessableEntity: {
    id: 'ErrorUnprocessableEntity',
    description:
      'The server understands the content type of the request entity, and the syntax of the request entity is correct, but it was unable to process the contained instructions.'
  }
}
