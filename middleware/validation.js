const { z } = require('zod')

const validateCustomer = (req, res, next) => {
  const customerSchema = z.object({
    name: z.string().min(1, '客戶姓名為必填項目').max(100, '客戶姓名不能超過100字'),
    email: z.string().email('請輸入有效的電子郵件').optional().or(z.literal('')),
    phone: z.string().max(20, '電話號碼不能超過20字').optional(),
    idNumber: z.string().max(20, '身分證字號不能超過20字').optional(),
    gender: z.enum(['male', 'female', 'other'], { 
      errorMap: () => ({ message: '性別必須是 male, female 或 other' }) 
    }).optional(),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式應為 YYYY-MM-DD').optional(),
    zodiacSign: z.string().max(20, '星座不能超過20字').optional(),
    interests: z.string().max(500, '興趣描述不能超過500字').optional(),
    isMarried: z.boolean().optional(),
    hasChildren: z.boolean().optional(),
    customerLevel: z.enum(['A', 'B', 'C', 'D', 'E'], {
      errorMap: () => ({ message: '客戶等級必須是 A, B, C, D 或 E' })
    }).optional(),
    customerSource: z.string().max(100, '客戶來源不能超過100字').optional(),
    company: z.string().max(200, '公司名稱不能超過200字').optional(),
    position: z.string().max(100, '職位不能超過100字').optional(),
    address: z.string().max(500, '地址不能超過500字').optional(),
    city: z.string().max(50, '城市不能超過50字').optional(),
    country: z.string().max(50, '國家不能超過50字').optional(),
    website: z.string().url('請輸入有效的網址').optional().or(z.literal('')),
    notes: z.string().max(1000, '備註不能超過1000字').optional(),
    status: z.enum(['active', 'inactive', 'potential', 'lost'], {
      errorMap: () => ({ message: '狀態必須是 active, inactive, potential 或 lost' })
    }).optional(),
    priority: z.enum(['high', 'normal', 'low'], {
      errorMap: () => ({ message: '優先級必須是 high, normal 或 low' })
    }).optional(),
    lastContactDate: z.string().datetime('聯絡日期格式錯誤').optional(),
  })

  try {
    req.body = customerSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '輸入驗證失敗',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }
    next(error)
  }
}

const validateCustomerUpdate = (req, res, next) => {
  const updateSchema = z.object({
    name: z.string().min(1, '客戶姓名為必填項目').max(100, '客戶姓名不能超過100字').optional(),
    email: z.string().email('請輸入有效的電子郵件').optional().or(z.literal('')),
    phone: z.string().max(20, '電話號碼不能超過20字').optional(),
    idNumber: z.string().max(20, '身分證字號不能超過20字').optional(),
    gender: z.enum(['male', 'female', 'other'], { 
      errorMap: () => ({ message: '性別必須是 male, female 或 other' }) 
    }).optional(),
    birthday: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, '生日格式應為 YYYY-MM-DD').optional(),
    zodiacSign: z.string().max(20, '星座不能超過20字').optional(),
    interests: z.string().max(500, '興趣描述不能超過500字').optional(),
    isMarried: z.boolean().optional(),
    hasChildren: z.boolean().optional(),
    customerLevel: z.enum(['A', 'B', 'C', 'D', 'E'], {
      errorMap: () => ({ message: '客戶等級必須是 A, B, C, D 或 E' })
    }).optional(),
    customerSource: z.string().max(100, '客戶來源不能超過100字').optional(),
    company: z.string().max(200, '公司名稱不能超過200字').optional(),
    position: z.string().max(100, '職位不能超過100字').optional(),
    address: z.string().max(500, '地址不能超過500字').optional(),
    city: z.string().max(50, '城市不能超過50字').optional(),
    country: z.string().max(50, '國家不能超過50字').optional(),
    website: z.string().url('請輸入有效的網址').optional().or(z.literal('')),
    notes: z.string().max(1000, '備註不能超過1000字').optional(),
    status: z.enum(['active', 'inactive', 'potential', 'lost'], {
      errorMap: () => ({ message: '狀態必須是 active, inactive, potential 或 lost' })
    }).optional(),
    priority: z.enum(['high', 'normal', 'low'], {
      errorMap: () => ({ message: '優先級必須是 high, normal 或 low' })
    }).optional(),
    lastContactDate: z.string().datetime('聯絡日期格式錯誤').optional(),
  })

  try {
    req.body = updateSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '輸入驗證失敗',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }
    next(error)
  }
}

const validateRelationship = (req, res, next) => {
  const relationshipSchema = z.object({
    customerId: z.string().uuid('客戶ID格式錯誤'),
    relatedCustomerId: z.string().uuid('關聯客戶ID格式錯誤'),
    relationshipType: z.string().min(1, '關係類型為必填項目').max(50, '關係類型不能超過50字'),
    notes: z.string().max(500, '備註不能超過500字').optional(),
  })

  try {
    req.body = relationshipSchema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '輸入驗證失敗',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }
    next(error)
  }
}

const validatePagination = (req, res, next) => {
  const paginationSchema = z.object({
    page: z.string().regex(/^\d+$/, '頁碼必須是正整數').optional().default('1'),
    limit: z.string().regex(/^\d+$/, '每頁數量必須是正整數').optional().default('10'),
    search: z.string().max(100, '搜尋關鍵字不能超過100字').optional(),
    status: z.enum(['active', 'inactive', 'potential', 'lost']).optional(),
    customerLevel: z.enum(['A', 'B', 'C', 'D', 'E']).optional(),
  })

  try {
    req.query = paginationSchema.parse(req.query)
    
    const page = parseInt(req.query.page)
    const limit = parseInt(req.query.limit)
    
    if (page < 1 || page > 1000) {
      return res.status(400).json({ error: '頁碼必須在 1-1000 之間' })
    }
    
    if (limit < 1 || limit > 100) {
      return res.status(400).json({ error: '每頁數量必須在 1-100 之間' })
    }
    
    req.query.page = page
    req.query.limit = limit
    
    next()
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: '查詢參數驗證失敗',
        details: error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      })
    }
    next(error)
  }
}

module.exports = {
  validateCustomer,
  validateCustomerUpdate,
  validateRelationship,
  validatePagination
}