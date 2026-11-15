import { Document , model, Schema, Types } from 'mongoose'
export interface IRestaurant extends Document{
    name: string
    slug: string
    description: string
    cuisine: string
    priceRange: '$' | '$$' | '$$$' | '$$$$'
    rating: number
    reviews: number
    location: string
    address: string
    phone?: string
    openingTime?: string
    closingTime?: string
    image: string
    imageUrl?: string
    imagePublicId: string
    chef: string
    tags: string[]
    availableSlots: string[]
    featured: boolean
    exclusive: boolean
    owner: Types.ObjectId
    ownerId?: Types.ObjectId
    status: 'pending' | 'approved' | 'rejected'
    totalSeats: number,
    createdAt: Date
    updatedAt: Date
}
const restaurantSchema = new Schema <IRestaurant>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true

    },
    description: {
      type: String,
      required: true
    },
    cuisine: {
      type: String,
      required: true,
      trim: true
    },
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
      required: true
    },
    rating: {
      type: Number,
      default: 5.0,
      min: 1,
      max: 5
    },
    reviews: {
      type: Number,
      default: 0
    },
    location: {
      type: String,
      required: true,
      trim: true
    },
    address: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      trim: true,
      default: ""
    },
    openingTime: {
      type: String,
      default: "12:00"
    },
    closingTime: {
      type: String,
      default: "23:00"
    },
    image: {
      type: String,
      default: ""
    },
    imagePublicId: {
      type: String,
      default: ""
    },
    chef: {
      type: String,
      required: true
    },
    tags: [{
      type: String
    }],
    availableSlots: [{
      type: String
    }],
    featured: {
      type: Boolean,
      default: false
    },
    exclusive: {
      type: Boolean,
      default: false
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    status: {
      type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    totalSeats: {
      type: Number,
      default: 20
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
)

restaurantSchema.virtual('imageUrl').get(function (this: IRestaurant) {
  return this.image;
});

restaurantSchema.virtual('ownerId').get(function (this: IRestaurant) {
  return this.owner;
});


restaurantSchema.index({ owner: 1 });
restaurantSchema.index({ status: 1, createdAt: -1 });

export const Restaurant = model<IRestaurant>('Restaurant', restaurantSchema)