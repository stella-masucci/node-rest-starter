import { Document, Model } from 'mongoose';
import { BinaryLike } from 'crypto';
import {
	ContainsSearchPlugin,
	TextSearchPlugin
} from '../../common/mongoose/types';

type UserRoles = {
	user?: boolean;
	editor?: boolean;
	auditor?: boolean;
	admin?: boolean;
};

interface IUser extends Document {
	name: string;

	organization: string;
	organizationLevels: Object;
	email: string;
	phone: string;
	username: string;
	password: string;
	provider: string;
	providerData: Object;
	additionalProvidersData: Object;
	roles: UserRoles;
	canProxy: boolean;
	externalGroups: string[];
	externalRoles: string[];
	bypassAccessCheck: boolean;
	updated: Date | number;
	created: Date;
	messagesAcknowledged: Date;
	alertsViewed: Date;
	resetPasswordToken: string;
	resetPasswordExpires: string;
	acceptedEua: Date | number;
	lastLogin: Date | number;
	lastLoginWithAccess: Date | number;
	newFeatureDismissed: Date;
	preferences: Object;
	salt: BinaryLike;
}

export interface UserDocument extends IUser {
	authenticate(password: string): boolean;
	hashPassword(password: string): string;
}

type QueryHelpers<T> = ContainsSearchPlugin &
	TextSearchPlugin &
	PaginatePlugin<T>;

export interface UserModel
	extends Model<UserDocument, QueryHelpers<UserDocument>> {
	createCopy(user: Object): Object;
	auditCopy(user: Object, userIP?: string): Object;
}
