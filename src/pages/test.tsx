import React from 'react';
import { useForm } from 'react-hook-form';

interface DeliveryFormData {
    customerName: string;
    phoneNumber: string;
    email: string;
    deliveryAddress: string;
    items: {
        name: string;
        quantity: number;
        specialInstructions: string;
    }[];
    deliveryInstructions: string;
    paymentMethod: 'cash' | 'card' | 'online';
}

const FoodDeliveryForm: React.FC = () => {
    const { register, handleSubmit, formState: { errors } } = useForm<DeliveryFormData>();

    const onSubmit = (data: DeliveryFormData) => {
        console.log('Form submitted:', data);
        // Handle form submission here
    };

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-[#0e1726] rounded-lg shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-center">Food Delivery Order</h2>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Customer Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                    
                    <div className="flex flex-col">
                        <label htmlFor="customerName" className="mb-1">Full Name *</label>
                        <input
                            type="text"
                            id="customerName"
                            className="form-input rounded-md"
                            placeholder="Enter your full name"
                            {...register('customerName', { required: 'Name is required' })}
                        />
                        {errors.customerName && (
                            <span className="text-red-500 text-sm">{errors.customerName.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="phoneNumber" className="mb-1">Phone Number *</label>
                        <input
                            type="tel"
                            id="phoneNumber"
                            className="form-input rounded-md"
                            placeholder="Enter your phone number"
                            {...register('phoneNumber', { 
                                required: 'Phone number is required',
                                pattern: {
                                    value: /^[0-9+-]+$/,
                                    message: 'Please enter a valid phone number'
                                }
                            })}
                        />
                        {errors.phoneNumber && (
                            <span className="text-red-500 text-sm">{errors.phoneNumber.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="email" className="mb-1">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="form-input rounded-md"
                            placeholder="Enter your email"
                            {...register('email', {
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Please enter a valid email address'
                                }
                            })}
                        />
                        {errors.email && (
                            <span className="text-red-500 text-sm">{errors.email.message}</span>
                        )}
                    </div>
                </div>

                {/* Delivery Address Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Delivery Address</h3>
                    
                    <div className="flex flex-col">
                        <label htmlFor="deliveryAddress" className="mb-1">Delivery Address *</label>
                        <textarea
                            id="deliveryAddress"
                            className="form-textarea rounded-md"
                            rows={3}
                            placeholder="Enter your complete delivery address"
                            {...register('deliveryAddress', { required: 'Delivery address is required' })}
                        />
                        {errors.deliveryAddress && (
                            <span className="text-red-500 text-sm">{errors.deliveryAddress.message}</span>
                        )}
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="deliveryInstructions" className="mb-1">Delivery Instructions</label>
                        <textarea
                            id="deliveryInstructions"
                            className="form-textarea rounded-md"
                            rows={2}
                            placeholder="Any special delivery instructions? (Optional)"
                            {...register('deliveryInstructions')}
                        />
                    </div>
                </div>

                {/* Payment Method Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Payment Method</h3>
                    
                    <div className="flex gap-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="cash"
                                className="form-radio"
                                {...register('paymentMethod', { required: 'Please select a payment method' })}
                            />
                            <span className="ml-2">Cash on Delivery</span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="card"
                                className="form-radio"
                                {...register('paymentMethod')}
                            />
                            <span className="ml-2">Card on Delivery</span>
                        </label>
                        
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="online"
                                className="form-radio"
                                {...register('paymentMethod')}
                            />
                            <span className="ml-2">Online Payment</span>
                        </label>
                    </div>
                    {errors.paymentMethod && (
                        <span className="text-red-500 text-sm">{errors.paymentMethod.message}</span>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-6 rounded-lg transition duration-300"
                    >
                        Place Order
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FoodDeliveryForm;
