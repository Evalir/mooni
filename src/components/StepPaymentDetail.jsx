import React, { useState , useEffect} from 'react';
import useForm from 'react-hook-form';
import {useDispatch, useSelector} from 'react-redux';

import { Box, Grid } from '@material-ui/core';

import { Button, Field, IconArrowLeft, IconArrowRight } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';
import RateForm from '../components/RateForm';

import { setPaymentDetail } from '../redux/payment/actions';
import { getPaymentDetail } from '../redux/payment/selectors';

const fields = {
  outputAmount: {
    required: true,
    min: 10,
    pattern: /^[0-9]+\.?[0-9]*$/,
    validate: value => Number(value) > 10,
  },
  reference: {
    pattern: /^[0-9A-Za-z ]*$/,
  },
};

function StepPaymentDetail({ onComplete, onBack }) {
  const paymentDetails = useSelector(getPaymentDetail);
  const dispatch = useDispatch();
  const [rateDetails, setRateDetails] = useState(null);

  const { register, handleSubmit, errors, setValue } = useForm({
    mode: 'onChange',
    defaultValues: paymentDetails ? {
      reference: paymentDetails.reference ?? '',
    } : {
      reference: '',
    },
  });

  useEffect(() => {
    rateDetails && setValue('outputAmount', rateDetails.outputAmount, true);
  }, [rateDetails, setValue]);

  useEffect(() => {
    register({ name: 'outputAmount' }, fields.outputAmount);
  }, [register]);

  const onSubmit = handleSubmit(async data => {
    dispatch(setPaymentDetail({
      inputCurrency: rateDetails.inputCurrency,
      outputAmount: rateDetails.outputAmount,
      outputCurrency: rateDetails.outputCurrency,
      reference: data.reference,
    }));

    onComplete();
  });

  const hasErrors = Object.keys(errors).length !== 0;

  return (
    <Box width={1}>
      <form onSubmit={onSubmit}>
        <RateForm onChange={setRateDetails} invalid={!!errors.outputAmount}/>
        <Box py={2}>
          <Field label="Reference (optional)">
            <WideInput
              name="reference"
              ref={register(fields.reference)}
              placeholder="Bill A2313"
            />
            {errors.reference && <FieldError>Invalid reference, please only use regular letters and numbers</FieldError>}
          </Field>
        </Box>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <Button mode="normal" onClick={onBack} wide icon={<IconArrowLeft/>} label="Go back" />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Button mode="strong" onClick={onSubmit} wide icon={<IconArrowRight/>} label="Save amount" disabled={hasErrors} />
          </Grid>
        </Grid>
      </form>
    </Box>
  )
}

export default StepPaymentDetail;
