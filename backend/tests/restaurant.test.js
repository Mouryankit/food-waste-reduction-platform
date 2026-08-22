const { AddDonation, myDonation, getDonationDetail, updateDonationDetail, deleteDonation } = require('../controllers/restaurant');
const Donation = require('../models/donationSchema');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailHelper');

// Mock dependencies
jest.mock('../models/donationSchema');
jest.mock('../models/User');
jest.mock('../utils/emailHelper', () => ({
    sendEmail: jest.fn()
}));

describe('Restaurant Controller Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            body: {},
            params: {},
            user: { id: 'restaurant-123', role: 'restaurant' }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('AddDonation', () => {
        it('should return error if required data fields are missing', async () => {
            mockReq.body = { foodName: 'Soup' };

            await AddDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Data is missing' });
        });

        it('should return error if role is not restaurant', async () => {
            mockReq.user.role = 'ngo';
            mockReq.body = {
                foodName: 'Bread', quantity: 10, unit: 'pcs', description: 'Fresh',
                phone: '1234567890', pickupAddress: '123 Main St',
                pickupLocation: { latitude: 1, longitude: 2 }, expiryDate: new Date()
            };

            await AddDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'you are not autherized to add donations' });
        });

        it('should save donation and return success without notifications', async () => {
            mockReq.body = {
                foodName: 'Bread', quantity: 10, unit: 'pcs', description: 'Fresh',
                phone: '1234567890', pickupAddress: '123 Main St',
                pickupLocation: { latitude: 1, longitude: 2 }, expiryDate: new Date().toISOString(),
                notifyNgos: false
            };

            const mockSave = jest.fn().mockResolvedValue({ _id: 'donation-123', ...mockReq.body });
            Donation.mockImplementation(() => ({
                save: mockSave
            }));

            await AddDonation(mockReq, mockRes);

            expect(mockSave).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation Added succesefully' });
        });

        it('should save donation and trigger NGO notifications when notifyNgos is true', async () => {
            mockReq.body = {
                foodName: 'Bread', quantity: 10, unit: 'pcs', description: 'Fresh',
                phone: '1234567890', pickupAddress: '123 Main St',
                pickupLocation: { latitude: 1, longitude: 2 }, expiryDate: new Date().toISOString(),
                notifyNgos: true
            };

            const mockDonationResult = { _id: 'donation-123', ...mockReq.body };
            const mockSave = jest.fn().mockResolvedValue(mockDonationResult);
            Donation.mockImplementation(() => ({
                save: mockSave
            }));

            User.findById.mockResolvedValue({ name: 'Bistro One' });
            User.find.mockResolvedValue([{ email: 'ngo1@example.com' }, { email: 'ngo2@example.com' }]);
            sendEmail.mockResolvedValue({ messageId: 'msg-id' });

            await AddDonation(mockReq, mockRes);

            expect(mockSave).toHaveBeenCalled();
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation Added succesefully' });

            // Allow async notification promise to resolve
            await new Promise((resolve) => setTimeout(resolve, 50));
            expect(User.findById).toHaveBeenCalledWith('restaurant-123');
            expect(User.find).toHaveBeenCalledWith({ role: 'ngo', valid: true }, 'email');
            expect(sendEmail).toHaveBeenCalled();
        });

        it('should return 401 if saving donation fails', async () => {
            mockReq.body = {
                foodName: 'Bread', quantity: 10, unit: 'pcs', description: 'Fresh',
                phone: '1234567890', pickupAddress: '123 Main St',
                pickupLocation: { latitude: 1, longitude: 2 }, expiryDate: new Date().toISOString()
            };

            const mockSave = jest.fn().mockRejectedValue(new Error('Save failed'));
            Donation.mockImplementation(() => ({
                save: mockSave
            }));

            await AddDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Error in saving data'
            }));
        });
    });

    describe('myDonation', () => {
        it('should fetch all restaurant donations', async () => {
            const mockPopulate = jest.fn().mockResolvedValue([{ foodName: 'Bread' }]);
            Donation.find.mockReturnValue({ populate: mockPopulate });

            await myDonation(mockReq, mockRes);

            expect(Donation.find).toHaveBeenCalledWith({ userObjectId: 'restaurant-123' });
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Data send Succesefully',
                result: [{ foodName: 'Bread' }]
            });
        });

        it('should return error on database failure', async () => {
            const mockPopulate = jest.fn().mockRejectedValue(new Error('DB error'));
            Donation.find.mockReturnValue({ populate: mockPopulate });

            await myDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'some error occurs'
            }));
        });
    });

    describe('getDonationDetail', () => {
        it('should fetch single donation detail by ID', async () => {
            mockReq.params.id = 'donation-123';
            const mockPopulate = jest.fn().mockResolvedValue({ _id: 'donation-123', foodName: 'Pizza' });
            Donation.findById.mockReturnValue({ populate: mockPopulate });

            await getDonationDetail(mockReq, mockRes);

            expect(Donation.findById).toHaveBeenCalledWith('donation-123');
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Data send Succesefully',
                data: { _id: 'donation-123', foodName: 'Pizza' }
            });
        });

        it('should return error on get details failure', async () => {
            mockReq.params.id = 'donation-123';
            const mockPopulate = jest.fn().mockRejectedValue(new Error('Find error'));
            Donation.findById.mockReturnValue({ populate: mockPopulate });

            await getDonationDetail(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'some error occurs'
            }));
        });
    });

    describe('updateDonationDetail', () => {
        it('should return error if fields are missing', async () => {
            mockReq.body = { foodName: 'Noodles' };

            await updateDonationDetail(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Data is missing' });
        });

        it('should return error if role is not restaurant', async () => {
            mockReq.user.role = 'ngo';
            mockReq.body = {
                foodName: 'Noodles', quantity: 5, unit: 'kg', description: 'Veg',
                phone: '1234567890', pickupAddress: '123 Ave',
                pickupLocation: { latitude: 5, longitude: 6 }, expiryDate: new Date()
            };

            await updateDonationDetail(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'you are not autherized to add donations' });
        });

        it('should successfully update donation', async () => {
            mockReq.params.id = 'donation-123';
            mockReq.body = {
                foodName: 'Noodles', quantity: 5, unit: 'kg', description: 'Veg',
                phone: '1234567890', pickupAddress: '123 Ave',
                pickupLocation: { latitude: 5, longitude: 6 }, expiryDate: new Date().toISOString()
            };

            Donation.findOneAndUpdate.mockResolvedValue({});

            await updateDonationDetail(mockReq, mockRes);

            expect(Donation.findOneAndUpdate).toHaveBeenCalledWith(
                { _id: 'donation-123' },
                expect.any(Object),
                { new: true, runValidators: true }
            );
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation updated succesefully' });
        });

        it('should return 401 error if update operation fails', async () => {
            mockReq.params.id = 'donation-123';
            mockReq.body = {
                foodName: 'Noodles', quantity: 5, unit: 'kg', description: 'Veg',
                phone: '1234567890', pickupAddress: '123 Ave',
                pickupLocation: { latitude: 5, longitude: 6 }, expiryDate: new Date().toISOString()
            };

            Donation.findOneAndUpdate.mockRejectedValue(new Error('Update error'));

            await updateDonationDetail(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
                message: 'Error in saving data'
            }));
        });
    });

    describe('deleteDonation', () => {
        it('should return 404 if donation is not found', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockResolvedValue(null);

            await deleteDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Donation not found' });
        });

        it('should return 403 if user is not authorized to delete the donation', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockResolvedValue({
                _id: 'donation-123',
                userObjectId: 'restaurant-999' // owned by someone else
            });

            await deleteDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Unauthorized' });
        });

        it('should delete donation on success', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockResolvedValue({
                _id: 'donation-123',
                userObjectId: 'restaurant-123'
            });
            Donation.findByIdAndDelete.mockResolvedValue({});

            await deleteDonation(mockReq, mockRes);

            expect(Donation.findByIdAndDelete).toHaveBeenCalledWith('donation-123');
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ success: true, message: 'Donation deleted successfully' });
        });

        it('should return 500 error on delete database failure', async () => {
            mockReq.params.id = 'donation-123';
            Donation.findById.mockRejectedValue(new Error('Delete error'));

            await deleteDonation(mockReq, mockRes);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ success: false, message: 'Internal Server Error' });
        });
    });
});
