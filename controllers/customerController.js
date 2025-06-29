const { db } = require('../connection/dbConnection')
const { customers, customerRelationships } = require('../connection/schema/customers')
const { eq, and, or, like, desc, count, sql } = require('drizzle-orm')

const getAllCustomers = async (req, res) => {
  try {
    const { page, limit, search, status, customerLevel } = req.query
    const offset = (page - 1) * limit

    const conditions = [eq(customers.isActive, true)]
    
    if (search) {
      const searchTerm = `%${search.trim()}%`
      conditions.push(
        or(
          like(customers.name, searchTerm),
          like(customers.email, searchTerm),
          like(customers.phone, searchTerm),
          like(customers.company, searchTerm)
        )
      )
    }
    if (status) conditions.push(eq(customers.status, status))
    if (customerLevel) conditions.push(eq(customers.customerLevel, customerLevel))
    
    const whereClause = and(...conditions)
    
    const [result, totalResult] = await Promise.all([
      db.select().from(customers)
        .where(whereClause)
        .orderBy(desc(customers.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(customers).where(whereClause)
    ])

    const total = totalResult[0].count
    
    res.json({
      success: true,
      customers: result,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('獲取客戶列表失敗:', error)
    res.status(500).json({ 
      success: false,
      error: '獲取客戶列表失敗',
      message: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    })
  }
}

const getCustomerById = async (req, res) => {
  try {
    const { id } = req.params
    
    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: '無效的客戶ID' 
      })
    }

    const [customer, relationships] = await Promise.all([
      db.select().from(customers)
        .where(and(eq(customers.id, id), eq(customers.isActive, true))),
      db.select({
        id: customerRelationships.id,
        relatedCustomerId: customerRelationships.relatedCustomerId,
        relationshipType: customerRelationships.relationshipType,
        notes: customerRelationships.notes,
        relatedCustomerName: customers.name
      })
      .from(customerRelationships)
      .leftJoin(customers, eq(customerRelationships.relatedCustomerId, customers.id))
      .where(eq(customerRelationships.customerId, id))
    ])
    
    if (customer.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: '客戶不存在' 
      })
    }

    res.json({
      success: true,
      customer: customer[0],
      relationships
    })
  } catch (error) {
    console.error('獲取客戶資料失敗:', error)
    res.status(500).json({ 
      success: false,
      error: '獲取客戶資料失敗',
      message: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    })
  }
}

const createCustomer = async (req, res) => {
  try {
    const customerData = req.body

    const existingChecks = []
    if (customerData.email) {
      existingChecks.push(
        db.select().from(customers)
          .where(and(eq(customers.email, customerData.email), eq(customers.isActive, true)))
      )
    }
    if (customerData.idNumber) {
      existingChecks.push(
        db.select().from(customers)
          .where(and(eq(customers.idNumber, customerData.idNumber), eq(customers.isActive, true)))
      )
    }

    if (existingChecks.length > 0) {
      const results = await Promise.all(existingChecks)
      if (customerData.email && results[0] && results[0].length > 0) {
        return res.status(409).json({ 
          success: false,
          error: '此 email 已存在' 
        })
      }
      if (customerData.idNumber && results[results.length - 1] && results[results.length - 1].length > 0) {
        return res.status(409).json({ 
          success: false,
          error: '此身分證字號已存在' 
        })
      }
    }

    const newCustomer = await db.insert(customers).values({
      ...customerData,
      assignedTo: req.user?.id,
      updatedAt: new Date()
    }).returning()

    res.status(201).json({ 
      success: true,
      message: '客戶創建成功', 
      customer: newCustomer[0] 
    })
  } catch (error) {
    console.error('創建客戶失敗:', error)
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false,
        error: '客戶資料重複，請檢查 email 或身分證字號' 
      })
    }
    
    res.status(500).json({ 
      success: false,
      error: '創建客戶失敗',
      message: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    })
  }
}

const updateCustomer = async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: '無效的客戶ID' 
      })
    }

    const existingCustomer = await db.select().from(customers)
      .where(and(eq(customers.id, id), eq(customers.isActive, true)))
    
    if (existingCustomer.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: '客戶不存在' 
      })
    }

    const checks = []
    if (updateData.email && updateData.email !== existingCustomer[0].email) {
      checks.push(
        db.select().from(customers)
          .where(and(eq(customers.email, updateData.email), eq(customers.isActive, true)))
      )
    }
    if (updateData.idNumber && updateData.idNumber !== existingCustomer[0].idNumber) {
      checks.push(
        db.select().from(customers)
          .where(and(eq(customers.idNumber, updateData.idNumber), eq(customers.isActive, true)))
      )
    }

    if (checks.length > 0) {
      const results = await Promise.all(checks)
      for (const result of results) {
        if (result.length > 0) {
          return res.status(409).json({ 
            success: false,
            error: '客戶資料重複，請檢查 email 或身分證字號' 
          })
        }
      }
    }

    const updatedCustomer = await db
      .update(customers)
      .set({
        ...updateData,
        updatedAt: new Date()
      })
      .where(eq(customers.id, id))
      .returning()

    res.json({ 
      success: true,
      message: '客戶更新成功', 
      customer: updatedCustomer[0] 
    })
  } catch (error) {
    console.error('更新客戶失敗:', error)
    
    if (error.code === '23505') {
      return res.status(409).json({ 
        success: false,
        error: '客戶資料重複，請檢查 email 或身分證字號' 
      })
    }
    
    res.status(500).json({ 
      success: false,
      error: '更新客戶失敗',
      message: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    })
  }
}

const deleteCustomer = async (req, res) => {
  try {
    const { id } = req.params

    if (!id || typeof id !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: '無效的客戶ID' 
      })
    }

    const existingCustomer = await db.select().from(customers)
      .where(and(eq(customers.id, id), eq(customers.isActive, true)))
    
    if (existingCustomer.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: '客戶不存在' 
      })
    }

    await db.transaction(async (tx) => {
      await tx.delete(customerRelationships).where(
        or(
          eq(customerRelationships.customerId, id),
          eq(customerRelationships.relatedCustomerId, id)
        )
      )

      await tx.update(customers)
        .set({ 
          isActive: false,
          updatedAt: new Date()
        })
        .where(eq(customers.id, id))
    })

    res.json({ 
      success: true,
      message: '客戶刪除成功' 
    })
  } catch (error) {
    console.error('刪除客戶失敗:', error)
    res.status(500).json({ 
      success: false,
      error: '刪除客戶失敗',
      message: process.env.NODE_ENV === 'development' ? error.message : '內部服務器錯誤'
    })
  }
}

const addCustomerRelationship = async (req, res) => {
  try {
    const { customerId, relatedCustomerId, relationshipType, notes } = req.body

    if (!customerId || !relatedCustomerId || !relationshipType) {
      return res.status(400).json({ error: '客戶ID、關聯客戶ID和關係類型為必填項目' })
    }

    const existingRelationship = await db
      .select()
      .from(customerRelationships)
      .where(
        and(
          eq(customerRelationships.customerId, customerId),
          eq(customerRelationships.relatedCustomerId, relatedCustomerId)
        )
      )

    if (existingRelationship.length > 0) {
      return res.status(409).json({ error: '此客戶關係已存在' })
    }

    const newRelationship = await db.insert(customerRelationships).values({
      customerId,
      relatedCustomerId,
      relationshipType,
      notes
    }).returning()

    res.status(201).json({ 
      message: '客戶關係添加成功', 
      relationship: newRelationship[0] 
    })
  } catch (error) {
    console.error('添加客戶關係失敗:', error)
    res.status(500).json({ error: '添加客戶關係失敗' })
  }
}

const removeCustomerRelationship = async (req, res) => {
  try {
    const { id } = req.params

    const existingRelationship = await db.select().from(customerRelationships).where(eq(customerRelationships.id, id))
    if (existingRelationship.length === 0) {
      return res.status(404).json({ error: '客戶關係不存在' })
    }

    await db.delete(customerRelationships).where(eq(customerRelationships.id, id))

    res.json({ message: '客戶關係刪除成功' })
  } catch (error) {
    console.error('刪除客戶關係失敗:', error)
    res.status(500).json({ error: '刪除客戶關係失敗' })
  }
}

module.exports = {
  getAllCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  addCustomerRelationship,
  removeCustomerRelationship
}