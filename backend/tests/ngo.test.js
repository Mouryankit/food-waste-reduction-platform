const { acceptDonation, getAllDonation, getAcceptedDonation, deliverDonation, getDeliveredDonation } = require('../controllers/ngo');
const Donation = require('../models/donationSchema');

// Mock Donation model
jest.mock('../models/donationSchema');

describe('NGO Controller Unit Tests', () => {
    let mockReq;
    let mockRes;

    beforeEach(() => {
        mockReq = {
            body: {},
            user: { id: 'ngo-123', role: 'ngo' }
        };
        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
            send: jest.fn()
        };
        jest.clearAllMocks();
    });

    describe('getAllDonation', () => {
        it('should successfully get all pending donations', async () => {
            Donation.find.mockResolvedValue([{ foodName: 'Apples', deliveryStatus: 'pending' }]);

            await getAllDonation(mockReq, mockRes);

            expect(Donation.find).toHaveBeenCalledWith({ deliveryStatus: 'pending' });
            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'data sent succesefully',
                result: [{ foodName: 'Apples', deliveryStatus: 'pending' }]
            });
        });

        it('should return error on database failure', async () => {
            Donation.find.mockRejectedValue(new Error('Find error'));

            await getAllDonation(mockReq, mockRes);

            expect(mockRes.send).toHaveBeenCalledWith({
                message: 'some error occured',
                error: expect.any(Error)
            });
        });
    });

    describe('getAcceptedDonation', () => {
        it('should successfully get all accepted donations for user NGO', async () => {
            Donation.find.mockResolvedValue([{ foodName: 'Apples', deliveryStatus: 'accepted' }]);

            await getAcceptedDonation(mockReq, mockRes);

            expect(Donation.find).toHaveBeenCalledWith({ ngoObjectId: 'ngo-123', deliveryStatus: 'accepted' });
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'data sent succesefully',
                result: [{ foodName: 'Apples', deliveryStatus: 'accepted' }]
            });
        });

        it('should return error on database failure', async () => {
            Donation.find.mockRejectedValue(new Error('Find error'));

            await getAcceptedDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'some error occur',
                error: expect.any(Error)
            });
        });
    });

    describe('acceptDonation', () => {
        it('should return error if role is not ngo', async () => {
            mockReq.user.role = 'restaurant';
            mockReq.body.donationId = 'donation-123';

            await acceptDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({ message: 'you are not autherized to accept donation' });
        });

        it('should return error if donation does not exist or is not pending', async () => {
            mockReq.body.donationId = 'donation-123';
            Donation.findOne.mockResolvedValue(null);

            await acceptDonation(mockReq, mockRes);

            expect(Donation.findOne).toHaveBeenCalledWith({ _id: 'donation-123', deliveryStatus: 'pending' });
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation not exist' });
        });

        it('should accept donation on success', async () => {
            mockReq.body.donationId = 'donation-123';
            Donation.findOne.mockResolvedValue({ _id: 'donation-123', deliveryStatus: 'pending' });
            Donation.updateOne.mockResolvedValue({ nModified: 1 });

            await acceptDonation(mockReq, mockRes);

            expect(Donation.updateOne).toHaveBeenCalledWith(
                { _id: 'donation-123' },
                { $set: { ngoObjectId: 'ngo-123', deliveryStatus: 'accepted' } }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation Accepted succesefully' });
        });

        it('should return error on database fail during acceptance', async () => {
            mockReq.body.donationId = 'donation-123';
            Donation.findOne.mockRejectedValue(new Error('DB error'));

            await acceptDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Some error occure',
                error: expect.any(Error)
            });
        });
    });

    describe('deliverDonation', () => {
        it('should return error if donation does not exist or is not accepted', async () => {
            mockReq.body.donationId = 'donation-123';
            Donation.findOne.mockResolvedValue(null);

            await deliverDonation(mockReq, mockRes);

            expect(Donation.findOne).toHaveBeenCalledWith({ _id: 'donation-123', deliveryStatus: 'accepted' });
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation not exist' });
        });

        it('should mark donation as delivered on success', async () => {
            mockReq.body.donationId = 'donation-123';
            Donation.findOne.mockResolvedValue({ _id: 'donation-123', deliveryStatus: 'accepted' });
            Donation.updateOne.mockResolvedValue({ nModified: 1 });

            await deliverDonation(mockReq, mockRes);

            expect(Donation.updateOne).toHaveBeenCalledWith(
                { _id: 'donation-123' },
                { $set: { deliveryStatus: 'delivered' } }
            );
            expect(mockRes.status).toHaveBeenCalledWith(200);
            expect(mockRes.json).toHaveBeenCalledWith({ message: 'Donation delivered succesefully' });
        });

        it('should return error on database update failure', async () => {
            mockReq.body.donationId = 'donation-123';
            Donation.findOne.mockRejectedValue(new Error('Update error'));

            await deliverDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'Failed to update status',
                error: expect.any(Error)
            });
        });
    });

    describe('getDeliveredDonation', () => {
        it('should return 200 with result if delivered donations exist', async () => {
            const mockList = [{ foodName: 'Apples', deliveryStatus: 'delivered' }];
            Donation.find.mockResolvedValue(mockList);

            await getDeliveredDonation(mockReq, mockRes);

            expect(Donation.find).toHaveBeenCalledWith({ ngoObjectId: 'ngo-123', deliveryStatus: 'delivered' });
            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'data sent succesefully',
                result: mockList
            });
        });

        it('should return error on database failure', async () => {
            Donation.find.mockRejectedValue(new Error('Find error'));

            await getDeliveredDonation(mockReq, mockRes);

            expect(mockRes.json).toHaveBeenCalledWith({
                message: 'some error occur',
                error: expect.any(Error)
            });
        });
    });
});
