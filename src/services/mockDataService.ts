import { 
  Service, 
  ServiceInterface, 
  ServiceRelation, 
  ChangeRecord, 
  Alert,
  ServiceStatus,
  Environment,
  AlertLevel,
  ChangeType
} from '@/types'

const generateId = () => Math.random().toString(36).substring(2, 9)

const domains = ['用户中心', '订单系统', '支付系统', '商品服务', '库存管理', '消息通知', '风控系统', '数据分析']
const owners = ['张三', '李四', '王五', '赵六', '陈七', '周八', '吴九', '郑十']

export const generateMockServices = (): Service[] => {
  const services: Service[] = [
    {
      id: 'svc-001',
      name: 'user-service',
      domain: '用户中心',
      environment: Environment.PRODUCTION,
      owner: '张三',
      status: ServiceStatus.NORMAL,
      isCore: true,
      description: '用户认证与信息管理服务，提供用户注册、登录、信息查询等功能',
      createdAt: '2024-01-15T08:00:00Z',
      updatedAt: '2024-06-10T14:30:00Z'
    },
    {
      id: 'svc-002',
      name: 'order-service',
      domain: '订单系统',
      environment: Environment.PRODUCTION,
      owner: '李四',
      status: ServiceStatus.NORMAL,
      isCore: true,
      description: '订单创建、查询、状态流转管理服务',
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-06-12T10:00:00Z'
    },
    {
      id: 'svc-003',
      name: 'payment-service',
      domain: '支付系统',
      environment: Environment.PRODUCTION,
      owner: '王五',
      status: ServiceStatus.WARNING,
      isCore: true,
      description: '支付渠道对接、交易处理、退款管理',
      createdAt: '2024-02-15T10:00:00Z',
      updatedAt: '2024-06-11T16:00:00Z'
    },
    {
      id: 'svc-004',
      name: 'product-service',
      domain: '商品服务',
      environment: Environment.PRODUCTION,
      owner: '赵六',
      status: ServiceStatus.NORMAL,
      isCore: false,
      description: '商品信息管理、SKU管理、价格管理',
      createdAt: '2024-03-01T11:00:00Z',
      updatedAt: '2024-06-08T09:00:00Z'
    },
    {
      id: 'svc-005',
      name: 'inventory-service',
      domain: '库存管理',
      environment: Environment.PRODUCTION,
      owner: '陈七',
      status: ServiceStatus.NORMAL,
      isCore: false,
      description: '库存数量管理、库存预警、库存调拨',
      createdAt: '2024-03-15T12:00:00Z',
      updatedAt: '2024-06-09T15:00:00Z'
    },
    {
      id: 'svc-006',
      name: 'notification-service',
      domain: '消息通知',
      environment: Environment.PRODUCTION,
      owner: '周八',
      status: ServiceStatus.NORMAL,
      isCore: false,
      description: '短信、邮件、推送通知发送服务',
      createdAt: '2024-04-01T13:00:00Z',
      updatedAt: '2024-06-07T11:00:00Z'
    },
    {
      id: 'svc-007',
      name: 'risk-control-service',
      domain: '风控系统',
      environment: Environment.PRODUCTION,
      owner: '吴九',
      status: ServiceStatus.ERROR,
      isCore: true,
      description: '交易风控、用户风控评估服务',
      createdAt: '2024-04-15T14:00:00Z',
      updatedAt: '2024-06-13T08:00:00Z'
    },
    {
      id: 'svc-008',
      name: 'analytics-service',
      domain: '数据分析',
      environment: Environment.STAGING,
      owner: '郑十',
      status: ServiceStatus.NORMAL,
      isCore: false,
      description: '用户行为分析、业务数据统计服务',
      createdAt: '2024-05-01T15:00:00Z',
      updatedAt: '2024-06-06T12:00:00Z'
    },
    {
      id: 'svc-009',
      name: 'gateway-service',
      domain: '用户中心',
      environment: Environment.PRODUCTION,
      owner: '张三',
      status: ServiceStatus.NORMAL,
      isCore: true,
      description: 'API网关服务，负责请求路由、限流、鉴权',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-06-13T09:00:00Z'
    },
    {
      id: 'svc-010',
      name: 'config-service',
      domain: '用户中心',
      environment: Environment.PRODUCTION,
      owner: '张三',
      status: ServiceStatus.NORMAL,
      isCore: false,
      description: '配置中心服务，动态配置管理',
      createdAt: '2024-01-10T08:00:00Z',
      updatedAt: '2024-06-05T10:00:00Z'
    }
  ]
  return services
}

export const generateMockInterfaces = (): ServiceInterface[] => {
  const interfaces: ServiceInterface[] = [
    { id: 'int-001', serviceId: 'svc-001', name: 'getUserInfo', path: '/api/user/{id}', method: 'GET', description: '获取用户详细信息' },
    { id: 'int-002', serviceId: 'svc-001', name: 'login', path: '/api/user/login', method: 'POST', description: '用户登录接口' },
    { id: 'int-003', serviceId: 'svc-001', name: 'register', path: '/api/user/register', method: 'POST', description: '用户注册接口' },
    { id: 'int-004', serviceId: 'svc-002', name: 'createOrder', path: '/api/order/create', method: 'POST', description: '创建订单' },
    { id: 'int-005', serviceId: 'svc-002', name: 'getOrder', path: '/api/order/{id}', method: 'GET', description: '查询订单详情' },
    { id: 'int-006', serviceId: 'svc-002', name: 'cancelOrder', path: '/api/order/{id}/cancel', method: 'POST', description: '取消订单' },
    { id: 'int-007', serviceId: 'svc-003', name: 'pay', path: '/api/payment/pay', method: 'POST', description: '发起支付' },
    { id: 'int-008', serviceId: 'svc-003', name: 'refund', path: '/api/payment/refund', method: 'POST', description: '退款接口' },
    { id: 'int-009', serviceId: 'svc-004', name: 'getProduct', path: '/api/product/{id}', method: 'GET', description: '获取商品信息' },
    { id: 'int-010', serviceId: 'svc-004', name: 'listProducts', path: '/api/products', method: 'GET', description: '商品列表查询' },
    { id: 'int-011', serviceId: 'svc-005', name: 'checkStock', path: '/api/inventory/check', method: 'GET', description: '检查库存' },
    { id: 'int-012', serviceId: 'svc-005', name: 'deductStock', path: '/api/inventory/deduct', method: 'POST', description: '扣减库存' },
    { id: 'int-013', serviceId: 'svc-006', name: 'sendNotification', path: '/api/notification/send', method: 'POST', description: '发送通知' },
    { id: 'int-014', serviceId: 'svc-007', name: 'evaluateRisk', path: '/api/risk/evaluate', method: 'POST', description: '风控评估' },
    { id: 'int-015', serviceId: 'svc-009', name: 'routeRequest', path: '/api/gateway/route', method: 'POST', description: '请求路由' }
  ]
  return interfaces
}

export const generateMockRelations = (): ServiceRelation[] => {
  const relations: ServiceRelation[] = [
    { id: 'rel-001', upstreamServiceId: 'svc-009', downstreamServiceId: 'svc-001', callType: 'sync', callFrequency: 1000 },
    { id: 'rel-002', upstreamServiceId: 'svc-009', downstreamServiceId: 'svc-002', callType: 'sync', callFrequency: 800 },
    { id: 'rel-003', upstreamServiceId: 'svc-009', downstreamServiceId: 'svc-004', callType: 'sync', callFrequency: 500 },
    { id: 'rel-004', upstreamServiceId: 'svc-002', downstreamServiceId: 'svc-001', callType: 'sync', callFrequency: 600 },
    { id: 'rel-005', upstreamServiceId: 'svc-002', downstreamServiceId: 'svc-003', callType: 'sync', callFrequency: 400 },
    { id: 'rel-006', upstreamServiceId: 'svc-002', downstreamServiceId: 'svc-005', callType: 'sync', callFrequency: 300 },
    { id: 'rel-007', upstreamServiceId: 'svc-002', downstreamServiceId: 'svc-004', callType: 'sync', callFrequency: 200 },
    { id: 'rel-008', upstreamServiceId: 'svc-003', downstreamServiceId: 'svc-007', callType: 'sync', callFrequency: 400 },
    { id: 'rel-009', upstreamServiceId: 'svc-003', downstreamServiceId: 'svc-001', callType: 'sync', callFrequency: 350 },
    { id: 'rel-010', upstreamServiceId: 'svc-004', downstreamServiceId: 'svc-005', callType: 'sync', callFrequency: 150 },
    { id: 'rel-011', upstreamServiceId: 'svc-002', downstreamServiceId: 'svc-006', callType: 'async', callFrequency: 100 },
    { id: 'rel-012', upstreamServiceId: 'svc-003', downstreamServiceId: 'svc-006', callType: 'async', callFrequency: 80 },
    { id: 'rel-013', upstreamServiceId: 'svc-001', downstreamServiceId: 'svc-010', callType: 'sync', callFrequency: 200 },
    { id: 'rel-014', upstreamServiceId: 'svc-008', downstreamServiceId: 'svc-001', callType: 'sync', callFrequency: 50 },
    { id: 'rel-015', upstreamServiceId: 'svc-008', downstreamServiceId: 'svc-002', callType: 'sync', callFrequency: 40 }
  ]
  return relations
}

export const generateMockChangeRecords = (): ChangeRecord[] => {
  const records: ChangeRecord[] = [
    {
      id: 'chg-001',
      serviceId: 'svc-001',
      title: '用户服务 v2.3.0 发布',
      content: '新增用户画像功能，优化登录性能',
      operator: '张三',
      changeType: ChangeType.DEPLOY,
      changeTime: '2024-06-10T14:30:00Z'
    },
    {
      id: 'chg-002',
      serviceId: 'svc-002',
      title: '订单服务 v1.8.5 发布',
      content: '修复订单状态同步问题，增加订单备注功能',
      operator: '李四',
      changeType: ChangeType.DEPLOY,
      changeTime: '2024-06-12T10:00:00Z'
    },
    {
      id: 'chg-003',
      serviceId: 'svc-003',
      title: '支付服务配置变更',
      content: '新增微信支付渠道配置',
      operator: '王五',
      changeType: ChangeType.CONFIG,
      changeTime: '2024-06-11T16:00:00Z'
    },
    {
      id: 'chg-004',
      serviceId: 'svc-007',
      title: '风控服务紧急回滚',
      content: '回滚至 v1.2.0 版本，修复评估逻辑错误',
      operator: '吴九',
      changeType: ChangeType.ROLLBACK,
      changeTime: '2024-06-13T08:00:00Z'
    },
    {
      id: 'chg-005',
      serviceId: 'svc-009',
      title: '网关服务扩容',
      content: '增加2个实例应对流量高峰',
      operator: '张三',
      changeType: ChangeType.SCALE,
      changeTime: '2024-06-13T09:00:00Z'
    }
  ]
  return records
}

export const generateMockAlerts = (): Alert[] => {
  const alerts: Alert[] = [
    {
      id: 'alt-001',
      serviceId: 'svc-007',
      title: '风控服务响应超时',
      level: AlertLevel.CRITICAL,
      message: '风控评估接口响应时间超过500ms阈值，当前平均响应时间800ms',
      alertTime: '2024-06-13T08:15:00Z',
      isResolved: false
    },
    {
      id: 'alt-002',
      serviceId: 'svc-007',
      title: '风控服务错误率上升',
      level: AlertLevel.ERROR,
      message: '风控服务错误率从0.1%上升到5%，需要立即处理',
      alertTime: '2024-06-13T08:10:00Z',
      isResolved: false
    },
    {
      id: 'alt-003',
      serviceId: 'svc-003',
      title: '支付服务响应延迟',
      level: AlertLevel.WARNING,
      message: '支付服务P99响应时间达到300ms，接近告警阈值',
      alertTime: '2024-06-13T07:30:00Z',
      isResolved: false
    },
    {
      id: 'alt-004',
      serviceId: 'svc-002',
      title: '订单服务QPS达到峰值',
      level: AlertLevel.INFO,
      message: '订单服务当前QPS达到800，系统运行正常',
      alertTime: '2024-06-13T06:00:00Z',
      isResolved: true
    },
    {
      id: 'alt-005',
      serviceId: 'svc-009',
      title: '网关服务流量激增',
      level: AlertLevel.WARNING,
      message: '网关服务流量较日常增长50%，已触发自动扩容',
      alertTime: '2024-06-13T09:05:00Z',
      isResolved: false
    }
  ]
  return alerts
}

export const initializeMockData = () => {
  const services = generateMockServices()
  const interfaces = generateMockInterfaces()
  const relations = generateMockRelations()
  const changeRecords = generateMockChangeRecords()
  const alerts = generateMockAlerts()
  
  return {
    services,
    interfaces,
    relations,
    changeRecords,
    alerts
  }
}

export const getDomains = (services: Service[]): string[] => {
  return Array.from(new Set(services.map((s) => s.domain)))
}