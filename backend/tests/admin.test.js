const {
    getAllUsers, blockUser, unblockUser, getUser, updateUser,
    getAllDonations, updateDonationStatus, getDonation, updateDonation
} = require('../controllers/admin');
const User = require('../models/User');
const Donation = require('../models/donationSchema');

// Mock models
jest.mock('../models/User');
jest.mock('../models/donationSchema');

describe('Admin Controller Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            params: {},
            body: {},
            query: {}
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllUsers', () => {
        it('should get all users excluding password', async () => {
            const mockSelect = jest.fn().mockResolvedValue([{ name: 'user1' }]);
            User.find.mockReturnValue({ select: mockSelect });

            await getAllUsers(mockReq, mockRes);

            expect(User.find).toHaveBeenCalled();
            expect(mockSelect).toHaveBeenCalledWith('-password');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, users: [{ name: 'user1' }] });
        });

        it('should return 500 error on database failure', async () => {
            const mockSelect = jest.fn().mockRejectedValue(new Error('Select error'));
            User.find.mockReturnValue({ select: mockSelect });

            await getAllUsers(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Select error' });
        });
    });

    describe('blockUser', () => {
        it('should return 404 if user not found', async () => {
            mockReq.params.id = 'user-123';
            User.findByIdAndUpdate.mockResolvedValue(null);

            await blockUser(mockReq, mockRes);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-123', { valid: false }, { new: true });
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
        });

        it('should block user successfully', async () => {
            mockReq.params.id = 'user-123';
            User.findByIdAndUpdate.mockResolvedValue({ _id: 'user-123', valid: false });

            await blockUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'User blocked successfully' });
        });

        it('should return 500 error on DB update failure', async () => {
            mockReq.params.id = 'user-123';
            User.findByIdAndUpdate.mockRejectedValue(new Error('Block failed'));

            await blockUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Block failed' });
        });
    });

    describe('unblockUser', () => {
        it('should return 404 if user not found', async () => {
            mockReq.params.id = 'user-123';
            User.findByIdAndUpdate.mockResolvedValue(null);

            await unblockUser(mockReq, mockRes);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith('user-123', { valid: true }, { new: true });
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
        });

        it('should unblock user successfully', async () => {
            mockReq.params.id = 'user-123';
            User.findByIdAndUpdate.mockResolvedValue({ _id: 'user-123', valid: true });

            await unblockUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'User unblocked successfully' });
        });

        it('should return 500 error on DB update failure', async () => {
            mockReq.params.id = 'user-123';
            User.findByIdAndUpdate.mockRejectedValue(new Error('Unblock failed'));

            await unblockUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Unblock failed' });
        });
    });

    describe('getUser', () => {
        it('should return user info without password', async () => {
            mockReq.params.id = 'user-123';
            const mockSelect = jest.fn().mockResolvedValue({ _id: 'user-123', name: 'user1' });
            User.findById.mockReturnValue({ select: mockSelect });

            await getUser(mockReq, mockRes);

            expect(User.findById).toHaveBeenCalledWith('user-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, user: { _id: 'user-123', name: 'user1' } });
        });

        it('should return 404 if user not found', async () => {
            mockReq.params.id = 'user-123';
            const mockSelect = jest.fn().mockResolvedValue(null);
            User.findById.mockReturnValue({ select: mockSelect });

            await getUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
        });

        it('should return 500 error on database lookup failure', async () => {
            mockReq.params.id = 'user-123';
            const mockSelect = jest.fn().mockRejectedValue(new Error('Find error'));
            User.findById.mockReturnValue({ select: mockSelect });

            await getUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Find error' });
        });
    });

    describe('updateUser', () => {
        it('should successfully update user details', async () => {
            mockReq.params.id = 'user-123';
            mockReq.body = { name: 'New Name', email: 'new@example.com', role: 'ngo', location: { latitude: 1, longitude: 2 } };

            const mockSelect = jest.fn().mockResolvedValue({ _id: 'user-123', name: 'New Name' });
            User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

            await updateUser(mockReq, mockRes);

            expect(User.findByIdAndUpdate).toHaveBeenCalledWith(
                'user-123',
                mockReq.body,
                { new: true, runValidators: true }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: true,
                message: 'User updated successfully',
                user: { _id: 'user-123', name: 'New Name' }
            });
        });

        it('should return 404 if user not found during update', async () => {
            mockReq.params.id = 'user-123';
            const mockSelect = jest.fn().mockResolvedValue(null);
            User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

            await updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'User not found' });
        });

        it('should return 500 on database update error', async () => {
            mockReq.params.id = 'user-123';
            const mockSelect = jest.fn().mockRejectedValue(new Error('Update error'));
            User.findByIdAndUpdate.mockReturnValue({ select: mockSelect });

            await updateUser(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Update error' });
        });
    });

    describe('getAllDonations', () => {
        it('should get all donations', async () => {
            const mockPopulate2 = jest.fn().mockResolvedValue([{ foodName: 'Apples' }]);
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
            Donation.find.mockReturnValue({ populate: mockPopulate1 });

            await getAllDonations(mockReq, mockRes);

            expect(Donation.find).toHaveBeenCalledWith({});
            expect(mockPopulate1).toHaveBeenCalledWith('userObjectId', 'name email');
            expect(mockPopulate2).toHaveBeenCalledWith('ngoObjectId', 'name email');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, donations: [{ foodName: 'Apples' }] });
        });

        it('should filter donations by status if query status is provided', async () => {
            mockReq.query.status = 'accepted';
            const mockPopulate2 = jest.fn().mockResolvedValue([{ foodName: 'Apples' }]);
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
            Donation.find.mockReturnValue({ populate: mockPopulate1 });

            await getAllDonations(mockReq, mockRes);

            expect(Donation.find).toHaveBeenCalledWith({ deliveryStatus: 'accepted' });
        });

        it('should return 500 error on database lookup failure', async () => {
            const mockPopulate2 = jest.fn().mockRejectedValue(new Error('Find error'));
            const mockPopulate1 = jest.fn().mockReturnValue({ populate: mockPopulate2 });
            Donation.find.mockReturnValue({ populate: mockPopulate1 });

            await getAllDonations(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Find error' });
        });
    });

    describe('updateDonationStatus', () => {
        it('should return 404 if donation not found', async () => {
            mockReq.params.id = 'donation-123';
            mockReq.body.deliveryStatus = 'delivered';
            Donation.findByIdAndUpdate.mockResolvedValue(null);

            await updateDonationStatus(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Donation not found' });
        });

        it('should update donation status successfully', async () => {
            mockReq.params.id = 'donation-123';
            mockReq.body.deliveryStatus = 'delivered';
            Donation.findByIdAndUpdate.mockResolvedValue({ _id: 'donation-123', deliveryStatus: 'delivered' });

            await updateDonationStatus(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Donation updated' });
        });

        it('should return 500 on status update database error', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await updateDonationStatus(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Update failed' });
        });
    });

    describe('getDonation', () => {
        it('should return 404 if donation not found', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockResolvedValue(null);

            await getDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Donation not found' });
        });

        it('should get donation detail successfully', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockResolvedValue({ _id: 'donation-123', foodName: 'Bread' });

            await getDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, donation: { _id: 'donation-123', foodName: 'Bread' } });
        });

        it('should return 500 on database error during lookup', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockRejectedValue(new Error('Lookup error'));

            await getDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Lookup error' });
        });
    });

    describe('updateDonation', () => {
        it('should return 404 if donation not found', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findByIdAndUpdate.mockResolvedValue(null);

            await updateDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Donation not found' });
        });

        it('should update donation details successfully', async () => {
            mockReq.params.id = 'donation-123';
            mockReq.body = { quantity: 15 };
            Donation.findByIdAndUpdate.mockResolvedValue({ _id: 'donation-123', quantity: 15 });

            await updateDonation(mockReq, mockRes);

            expect(Donation.findByIdAndUpdate).toHaveBeenCalledWith('donation-123', mockReq.body, { new: true, runValidators: true });
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Donation updated successfully', donation: { _id: 'donation-123', quantity: 15 } });
        });

        it('should return 500 on update database failure', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findByIdAndUpdate.mockRejectedValue(new Error('Update failed'));

            await updateDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Update failed' });
        });
    });
});
