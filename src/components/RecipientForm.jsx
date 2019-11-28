import React, { useState, useEffect } from 'react';
import useForm from 'react-hook-form';
import IBAN from 'iban';
import { makeStyles } from '@material-ui/core/styles';

import { COUNTRIES } from '../lib/countries';

import { Button, Field, IconArrowRight, DropDown } from '@aragon/ui'
import { WideInput, FieldError } from './StyledComponents';

const useStyles = makeStyles(() => ({
  fieldRow: {
    marginBottom: '15px',
  },
}));

const fields = {
  name: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  address: {
    required: true,
    minLength: 2,
    maxLength: 50,
  },
  zip: {
    required: true,
    minLength: 2,
    maxLength: 10,
  },
  city: {
    required: true,
    minLength: 2,
    maxLength: 10,
  },
  country: {
    required: true,
    minLength: 2,
    maxLength: 2,
    pattern: /^[A-Z]{2}$/,
  },
  iban: {
    required: true,
    minLength: 14,
    maxLength: 34,
    validate: IBAN.isValid,
  },
  bic_swift: {
    required: true,
    minLength: 8,
    maxLength: 11,
    pattern: /^[A-Z]{6}[A-Z2-9][A-NP-Z0-9]([A-Z0-9]{3}){0,1}$/,
  },
};

const countriesList = Object.keys(COUNTRIES);

function RecipientForm({ initialRecipient, onSubmit }) {
  const classes = useStyles();

  const { register, handleSubmit, errors, setValue } = useForm({
    mode: 'onChange',
    defaultValues: initialRecipient || undefined,
  });
  const [selectedCountry, setSelectedCountry] = useState(
    initialRecipient ? countriesList.indexOf(initialRecipient.owner.country) : null
  );
  const submit = handleSubmit(onSubmit);

  function setCountry(index) {
    setSelectedCountry(index);
    setValue('owner.country', countriesList[index]);
  }

  useEffect(() => {
    register({ name: 'owner.country' }, fields.country);
  }, []);

  return (
    <form onSubmit={submit}>
      <Field label="IBAN" className={classes.fieldRow}>
        <WideInput name="iban" ref={register(fields.iban)} required/>
        {errors.iban && <FieldError>Invalid IBAN</FieldError>}
      </Field>
      <Field label="BIC/SWIFT" className={classes.fieldRow}>
        <WideInput name="bic_swift" ref={register(fields.bic_swift)} required/>
        {errors.bic_swift && <FieldError>Invalid BIC</FieldError>}
      </Field>
      <Field label="Name" className={classes.fieldRow}>
        <WideInput name="owner.name" ref={register(fields.name)} required/>
        {errors['owner.name'] && <FieldError>Please enter your name</FieldError>}
      </Field>
      <Field label="Address" className={classes.fieldRow}>
        <WideInput name="owner.address" ref={register(fields.address)} required/>
        {errors['owner.address'] && <FieldError>Invalid address</FieldError>}
      </Field>
      <Field label="Zip/Postal code" className={classes.fieldRow}>
        <WideInput name="owner.zip" ref={register(fields.zip)} required/>
        {errors['owner.zip'] && <FieldError>Invalid Zip/Code</FieldError>}
      </Field>
      <Field label="City" className={classes.fieldRow}>
        <WideInput name="owner.city" ref={register(fields.city)} required/>
        {errors['owner.city'] && <FieldError>Invalid city</FieldError>}
      </Field>
      <Field label="Country" className={classes.fieldRow} required>
        <DropDown
          items={countriesList}
          selected={selectedCountry}
          onChange={setCountry}
          placeholder="Please select a country"
          wide
        />
        {errors['owner.country'] && <FieldError>Invalid country</FieldError>}
      </Field>
      <Button mode="strong" onClick={submit} wide icon={<IconArrowRight/>} label="Save recipient" />
    </form>
  )
}

export default RecipientForm;
