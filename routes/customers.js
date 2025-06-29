const express = require('express')
const router = express.Router()
const auth = require('../middleware/auth')
const {
  validateCustomer,
  validateCustomerUpdate,
  validateRelationship,
  validatePagination
} = require('../middleware/validation')
const {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerRelationship,
  removeCustomerRelationship
} = require('../controllers/customerController')

router.get('/', auth, validatePagination, getAllCustomers)
router.get('/:id', auth, getCustomerById)
router.post('/', auth, validateCustomer, createCustomer)
router.put('/:id', auth, validateCustomerUpdate, updateCustomer)
router.delete('/:id', auth, deleteCustomer)

router.post('/relationships', auth, validateRelationship, addCustomerRelationship)
router.delete('/relationships/:id', auth, removeCustomerRelationship)

module.exports = router