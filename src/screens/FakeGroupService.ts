// import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { Group, GroupMember, GroupInvitation, GroupStory, GroupRole, InvitationStatus } from '../../generated/prisma';
// import { CreateGroupDto } from './dto/create-group.dto';
// import { UpdateGroupDto } from './dto/update-group.dto';
// import { InviteUserDto } from './dto/invite-user.dto';

// @Injectable()
// export class GroupService {
//   constructor(private prisma: PrismaService) {}

//   /**
//    * Créer un nouveau groupe
//    */
//   async create(userId: number, dto: CreateGroupDto): Promise<Group> {
//     const group = await this.prisma.group.create({
//       data: {
//         name: dto.name,
//         description: dto.description,
//         imageUrl: dto.imageUrl,
//         ownerId: userId,
//       },
//       include: {
//         owner: {
//           include: {
//             profil: true,
//           },
//         },
//         members: true,
//       },
//     });

//     // Ajouter automatiquement le créateur comme membre avec le rôle OWNER
//     await this.prisma.groupMember.create({
//       data: {
//         groupId: group.id,
//         userId: userId,
//         role: GroupRole.OWNER,
//       },
//     });

//     return group;
//   }

//   /**
//    * Récupérer tous les groupes dont l'utilisateur est membre
//    */
//   async findAllByUser(userId: number): Promise<Group[]> {
//     const memberships = await this.prisma.groupMember.findMany({
//       where: { userId },
//       include: {
//         group: {
//           include: {
//             owner: {
//               include: {
//                 profil: true,
//               },
//             },
//             members: {
//               include: {
//                 user: {
//                   include: {
//                     profil: true,
//                   },
//                 },
//               },
//             },
//             _count: {
//               select: {
//                 members: true,
//                 stories: true,
//               },
//             },
//           },
//         },
//       },
//       orderBy: {
//         joinedAt: 'desc',
//       },
//     });

//     return memberships.map((m) => m.group);
//   }

//   /**
//    * Récupérer un groupe par son ID
//    */
//   async findOne(groupId: number, userId: number): Promise<Group> {
//     const group = await this.prisma.group.findUnique({
//       where: { id: groupId },
//       include: {
//         owner: {
//           include: {
//             profil: true,
//           },
//         },
//         members: {
//           include: {
//             user: {
//               include: {
//                 profil: true,
//               },
//             },
//           },
//         },
//         stories: {
//           include: {
//             story: {
//               include: {
//                 pages: {
//                   orderBy: { pageIndex: 'asc' },
//                 },
//                 user: {
//                   include: {
//                     profil: true,
//                   },
//                 },
//               },
//             },
//             sharedBy: {
//               include: {
//                 profil: true,
//               },
//             },
//           },
//           orderBy: {
//             createdAt: 'desc',
//           },
//         },
//         _count: {
//           select: {
//             members: true,
//             stories: true,
//           },
//         },
//       },
//     });

//     if (!group) {
//       throw new NotFoundException('Groupe introuvable');
//     }

//     // Vérifier que l'utilisateur est membre du groupe
//     const isMember = await this.isMember(groupId, userId);
//     if (!isMember) {
//       throw new ForbiddenException('Vous n\'êtes pas membre de ce groupe');
//     }

//     return group;
//   }

//   /**
//    * Mettre à jour un groupe
//    */
//   async update(groupId: number, userId: number, dto: UpdateGroupDto): Promise<Group> {
//     // Vérifier les permissions (OWNER ou ADMIN)
//     await this.checkPermissions(groupId, userId, [GroupRole.OWNER, GroupRole.ADMIN]);

//     return this.prisma.group.update({
//       where: { id: groupId },
//       data: dto,
//       include: {
//         owner: {
//           include: {
//             profil: true,
//           },
//         },
//         members: {
//           include: {
//             user: {
//               include: {
//                 profil: true,
//               },
//             },
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Supprimer un groupe (seulement le propriétaire)
//    */
//   async remove(groupId: number, userId: number): Promise<void> {
//     const group = await this.prisma.group.findUnique({
//       where: { id: groupId },
//     });

//     if (!group) {
//       throw new NotFoundException('Groupe introuvable');
//     }

//     if (group.ownerId !== userId) {
//       throw new ForbiddenException('Seul le propriétaire peut supprimer le groupe');
//     }

//     await this.prisma.group.delete({
//       where: { id: groupId },
//     });
//   }

//   /**
//    * Inviter un utilisateur à rejoindre le groupe
//    */
//   async inviteUser(groupId: number, inviterId: number, dto: InviteUserDto): Promise<GroupInvitation> {
//     // Vérifier les permissions
//     await this.checkPermissions(groupId, inviterId, [GroupRole.OWNER, GroupRole.ADMIN, GroupRole.MEMBER]);

//     // Trouver l'utilisateur à inviter
//     let inviteeId: number;
//     if (dto.userId) {
//       inviteeId = dto.userId;
//     } else if (dto.email) {
//       const user = await this.prisma.user.findUnique({
//         where: { email: dto.email },
//       });
//       if (!user) {
//         throw new NotFoundException('Utilisateur introuvable avec cet email');
//       }
//       inviteeId = user.id;
//     } else {
//       throw new BadRequestException('Vous devez fournir un userId ou un email');
//     }

//     // Vérifier que l'utilisateur n'est pas déjà membre
//     const existingMember = await this.prisma.groupMember.findUnique({
//       where: {
//         groupId_userId: {
//           groupId,
//           userId: inviteeId,
//         },
//       },
//     });

//     if (existingMember) {
//       throw new BadRequestException('Cet utilisateur est déjà membre du groupe');
//     }

//     // Vérifier qu'il n'y a pas déjà une invitation en attente
//     const existingInvitation = await this.prisma.groupInvitation.findUnique({
//       where: {
//         groupId_inviteeId: {
//           groupId,
//           inviteeId,
//         },
//       },
//     });

//     if (existingInvitation && existingInvitation.status === InvitationStatus.PENDING) {
//       throw new BadRequestException('Une invitation est déjà en attente pour cet utilisateur');
//     }

//     // Créer l'invitation
//     return this.prisma.groupInvitation.create({
//       data: {
//         groupId,
//         inviterId,
//         inviteeId,
//         status: InvitationStatus.PENDING,
//       },
//       include: {
//         group: {
//           include: {
//             owner: {
//               include: {
//                 profil: true,
//               },
//             },
//           },
//         },
//         inviter: {
//           include: {
//             profil: true,
//           },
//         },
//         invitee: {
//           include: {
//             profil: true,
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Récupérer toutes les invitations reçues par l'utilisateur
//    */
//   async getReceivedInvitations(userId: number): Promise<GroupInvitation[]> {
//     return this.prisma.groupInvitation.findMany({
//       where: {
//         inviteeId: userId,
//         status: InvitationStatus.PENDING,
//       },
//       include: {
//         group: {
//           include: {
//             owner: {
//               include: {
//                 profil: true,
//               },
//             },
//             _count: {
//               select: {
//                 members: true,
//               },
//             },
//           },
//         },
//         inviter: {
//           include: {
//             profil: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: 'desc',
//       },
//     });
//   }

//   /**
//    * Accepter une invitation
//    */
//   async acceptInvitation(invitationId: number, userId: number): Promise<GroupMember> {
//     const invitation = await this.prisma.groupInvitation.findUnique({
//       where: { id: invitationId },
//     });

//     if (!invitation) {
//       throw new NotFoundException('Invitation introuvable');
//     }

//     if (invitation.inviteeId !== userId) {
//       throw new ForbiddenException('Cette invitation ne vous est pas destinée');
//     }

//     if (invitation.status !== InvitationStatus.PENDING) {
//       throw new BadRequestException('Cette invitation a déjà été traitée');
//     }

//     // Mettre à jour le statut de l'invitation
//     await this.prisma.groupInvitation.update({
//       where: { id: invitationId },
//       data: { status: InvitationStatus.ACCEPTED },
//     });

//     // Ajouter l'utilisateur comme membre du groupe
//     return this.prisma.groupMember.create({
//       data: {
//         groupId: invitation.groupId,
//         userId: userId,
//         role: GroupRole.MEMBER,
//       },
//       include: {
//         group: {
//           include: {
//             owner: {
//               include: {
//                 profil: true,
//               },
//             },
//           },
//         },
//         user: {
//           include: {
//             profil: true,
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Refuser une invitation
//    */
//   async declineInvitation(invitationId: number, userId: number): Promise<void> {
//     const invitation = await this.prisma.groupInvitation.findUnique({
//       where: { id: invitationId },
//     });

//     if (!invitation) {
//       throw new NotFoundException('Invitation introuvable');
//     }

//     if (invitation.inviteeId !== userId) {
//       throw new ForbiddenException('Cette invitation ne vous est pas destinée');
//     }

//     if (invitation.status !== InvitationStatus.PENDING) {
//       throw new BadRequestException('Cette invitation a déjà été traitée');
//     }

//     // Mettre à jour le statut de l'invitation
//     await this.prisma.groupInvitation.update({
//       where: { id: invitationId },
//       data: { status: InvitationStatus.DECLINED },
//     });
//   }

//   /**
//    * Partager une histoire dans un groupe
//    */
//   async shareStory(groupId: number, userId: number, storyId: number): Promise<GroupStory> {
//     // Vérifier que l'utilisateur est membre du groupe
//     const isMember = await this.isMember(groupId, userId);
//     if (!isMember) {
//       throw new ForbiddenException('Vous devez être membre du groupe pour partager une histoire');
//     }

//     // Vérifier que l'histoire existe et appartient à l'utilisateur
//     const story = await this.prisma.story.findUnique({
//       where: { id: storyId },
//     });

//     if (!story) {
//       throw new NotFoundException('Histoire introuvable');
//     }

//     if (story.userId !== userId) {
//       throw new ForbiddenException('Vous ne pouvez partager que vos propres histoires');
//     }

//     // Vérifier que l'histoire n'est pas déjà partagée dans ce groupe
//     const existingShare = await this.prisma.groupStory.findUnique({
//       where: {
//         groupId_storyId: {
//           groupId,
//           storyId,
//         },
//       },
//     });

//     if (existingShare) {
//       throw new BadRequestException('Cette histoire est déjà partagée dans ce groupe');
//     }

//     // Partager l'histoire
//     return this.prisma.groupStory.create({
//       data: {
//         groupId,
//         storyId,
//         sharedById: userId,
//       },
//       include: {
//         story: {
//           include: {
//             pages: {
//               orderBy: { pageIndex: 'asc' },
//             },
//             user: {
//               include: {
//                 profil: true,
//               },
//             },
//           },
//         },
//         sharedBy: {
//           include: {
//             profil: true,
//           },
//         },
//       },
//     });
//   }

//   /**
//    * Quitter un groupe
//    */
//   async leaveGroup(groupId: number, userId: number): Promise<void> {
//     const group = await this.prisma.group.findUnique({
//       where: { id: groupId },
//     });

//     if (!group) {
//       throw new NotFoundException('Groupe introuvable');
//     }

//     // Le propriétaire ne peut pas quitter son propre groupe
//     if (group.ownerId === userId) {
//       throw new BadRequestException('Le propriétaire ne peut pas quitter le groupe. Supprimez le groupe ou transférez la propriété.');
//     }

//     // Supprimer l'adhésion
//     await this.prisma.groupMember.delete({
//       where: {
//         groupId_userId: {
//           groupId,
//           userId,
//         },
//       },
//     });
//   }

//   /**
//    * Exclure un membre du groupe (OWNER ou ADMIN)
//    */
//   async removeMember(groupId: number, userId: number, memberIdToRemove: number): Promise<void> {
//     // Vérifier les permissions
//     await this.checkPermissions(groupId, userId, [GroupRole.OWNER, GroupRole.ADMIN]);

//     const group = await this.prisma.group.findUnique({
//       where: { id: groupId },
//     });

//     // Le propriétaire ne peut pas être exclu
//     if (group.ownerId === memberIdToRemove) {
//       throw new BadRequestException('Le propriétaire ne peut pas être exclu du groupe');
//     }

//     // Supprimer le membre
//     await this.prisma.groupMember.delete({
//       where: {
//         groupId_userId: {
//           groupId,
//           userId: memberIdToRemove,
//         },
//       },
//     });
//   }

//   /**
//    * Vérifier si un utilisateur est membre d'un groupe
//    */
//   private async isMember(groupId: number, userId: number): Promise<boolean> {
//     const member = await this.prisma.groupMember.findUnique({
//       where: {
//         groupId_userId: {
//           groupId,
//           userId,
//         },
//       },
//     });

//     return !!member;
//   }

//   /**
//    * Vérifier les permissions d'un utilisateur dans un groupe
//    */
//   private async checkPermissions(groupId: number, userId: number, allowedRoles: GroupRole[]): Promise<void> {
//     const member = await this.prisma.groupMember.findUnique({
//       where: {
//         groupId_userId: {
//           groupId,
//           userId,
//         },
//       },
//     });

//     if (!member) {
//       throw new ForbiddenException('Vous n\'êtes pas membre de ce groupe');
//     }

//     if (!allowedRoles.includes(member.role)) {
//       throw new ForbiddenException('Vous n\'avez pas les permissions nécessaires');
//     }
//   }
// }
