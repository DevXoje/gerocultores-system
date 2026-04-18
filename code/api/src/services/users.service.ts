import { adminAuth, adminDb } from './firebase'
import { COLLECTIONS } from './collections'
import type {
  CreateUserDto,
  UpdateUserRoleDto,
  UserResponse,
  UpdateRoleResponse,
  DisableUserResponse,
} from '../types/user.types'

export class UsersService {
  private get collection() {
    return adminDb.collection(COLLECTIONS.usuarios)
  }

  async listUsers(): Promise<UserResponse[]> {
    const snapshot = await this.collection.get()
    return snapshot.docs.map((doc) => this.toResponse(doc.id, doc.data()))
  }

  async createUser(dto: CreateUserDto): Promise<UserResponse> {
    const userRecord = await adminAuth.createUser({
      email: dto.email,
      password: dto.password,
      displayName: dto.displayName,
    })

    await adminAuth.setCustomUserClaims(userRecord.uid, { role: dto.role })

    const now = new Date().toISOString()
    const userData = {
      email: dto.email,
      displayName: dto.displayName,
      role: dto.role,
      active: true,
      createdAt: now,
    }

    await this.collection.doc(userRecord.uid).set(userData)

    return {
      uid: userRecord.uid,
      ...userData,
    }
  }

  async updateUserRole(uid: string, dto: UpdateUserRoleDto): Promise<UpdateRoleResponse> {
    await adminAuth.setCustomUserClaims(uid, { role: dto.role })
    await this.collection.doc(uid).update({ role: dto.role })
    return { uid, role: dto.role }
  }

  async disableUser(uid: string): Promise<DisableUserResponse> {
    await adminAuth.updateUser(uid, { disabled: true })
    await this.collection.doc(uid).update({ active: false })
    return { uid, active: false }
  }

  private toResponse(id: string, data: FirebaseFirestore.DocumentData): UserResponse {
    return {
      uid: id,
      email: data['email'],
      displayName: data['displayName'],
      role: data['role'],
      active: data['active'],
      createdAt: data['createdAt'],
    }
  }
}
