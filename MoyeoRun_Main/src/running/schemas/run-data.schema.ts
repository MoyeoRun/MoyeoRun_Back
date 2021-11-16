import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { RunDataType } from '../running.type';

@Schema()
export class RunData extends Document {
  @Prop({
    required: true,
  })
  runData: RunDataType[][] | RunDataType[];

  @Prop({
    required: true,
  })
  runningsId: string;
}

const _RunDataSchema = SchemaFactory.createForClass(RunData);

_RunDataSchema.virtual('id').set(function (this: RunData) {
  return this._id.toHexString();
});
_RunDataSchema.set('toJSON', {
  virtuals: true,
});
_RunDataSchema.set('toObject', { virtuals: true });

_RunDataSchema.virtual('responseData').get(function (this: RunData) {
  return {
    id: this.id,
    runData: this.runData,
    runningsId: this.runningsId,
  };
});

_RunDataSchema.index({ runningsId: 1 }, { unique: true });

export const RunDataSchema = _RunDataSchema;
