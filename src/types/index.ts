export enum ServiceStatus {
  NORMAL = 'normal',
  WARNING = 'warning',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export enum Environment {
  DEVELOPMENT = 'development',
  TESTING = 'testing',
  STAGING = 'staging',
  PRODUCTION = 'production'
}

export enum AlertLevel {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

export enum ChangeType {
  DEPLOY = 'deploy',
  CONFIG = 'config',
  SCALE = 'scale',
  ROLLBACK = 'rollback'
}

export interface Service {
  id: string
  name: string
  domain: string
  environment: Environment
  owner: string
  status: ServiceStatus
  isCore: boolean
  description: string
  createdAt: string
  updatedAt: string
}

export interface ServiceInterface {
  id: string
  serviceId: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description: string
}

export interface ServiceRelation {
  id: string
  upstreamServiceId: string
  downstreamServiceId: string
  callType: 'sync' | 'async'
  callFrequency: number
}

export interface ChangeRecord {
  id: string
  serviceId: string
  title: string
  content: string
  operator: string
  changeType: ChangeType
  changeTime: string
}

export interface Alert {
  id: string
  serviceId: string
  title: string
  level: AlertLevel
  message: string
  alertTime: string
  isResolved: boolean
}

export interface InterfaceCall {
  id: string
  callerServiceId: string
  interfaceId: string
  callCount: number
  errorCount: number
}

export interface TopologyNode {
  id: string
  type: 'service'
  data: Service
  position: { x: number; y: number }
}

export interface TopologyEdge {
  id: string
  source: string
  target: string
  data: ServiceRelation
}

export const ENVIRONMENT_LABELS: Record<Environment, string> = {
  [Environment.DEVELOPMENT]: '开发环境',
  [Environment.TESTING]: '测试环境',
  [Environment.STAGING]: '预发环境',
  [Environment.PRODUCTION]: '生产环境'
}

export const STATUS_LABELS: Record<ServiceStatus, string> = {
  [ServiceStatus.NORMAL]: '正常',
  [ServiceStatus.WARNING]: '警告',
  [ServiceStatus.ERROR]: '异常',
  [ServiceStatus.OFFLINE]: '离线'
}

export const STATUS_COLORS: Record<ServiceStatus, string> = {
  [ServiceStatus.NORMAL]: '#10B981',
  [ServiceStatus.WARNING]: '#F59E0B',
  [ServiceStatus.ERROR]: '#EF4444',
  [ServiceStatus.OFFLINE]: '#6B7280'
}

export const ALERT_LEVEL_LABELS: Record<AlertLevel, string> = {
  [AlertLevel.INFO]: '信息',
  [AlertLevel.WARNING]: '警告',
  [AlertLevel.ERROR]: '错误',
  [AlertLevel.CRITICAL]: '严重'
}

export const ALERT_LEVEL_COLORS: Record<AlertLevel, string> = {
  [AlertLevel.INFO]: '#3B82F6',
  [AlertLevel.WARNING]: '#F59E0B',
  [AlertLevel.ERROR]: '#EF4444',
  [AlertLevel.CRITICAL]: '#DC2626'
}

export const CHANGE_TYPE_LABELS: Record<ChangeType, string> = {
  [ChangeType.DEPLOY]: '发布部署',
  [ChangeType.CONFIG]: '配置变更',
  [ChangeType.SCALE]: '扩缩容',
  [ChangeType.ROLLBACK]: '回滚'
}