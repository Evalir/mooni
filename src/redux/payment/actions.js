import Bity from '../../lib/bity';
import { getRecipient, getAmountDetail, getOrder, getContactPerson, getReference } from '../payment/selectors';
import { getAddress, getETHManager } from '../eth/selectors';
import { rateTokenForExactETH } from '../../lib/exchange';

export const SET_AMOUNT_DETAIL = 'SET_AMOUNT_DETAIL';
export const SET_RECIPIENT = 'SET_RECIPIENT';
export const SET_CONTACT_PERSON = 'SET_CONTACT_PERSON';
export const SET_REFERENCE = 'SET_REFERENCE';
export const SET_ORDER = 'SET_ORDER';
export const SET_ORDER_ERRORS = 'SET_ORDER_ERRORS';
export const SET_TOKEN_EXCHANGE = 'SET_TOKEN_EXCHANGE';
export const RESET_ORDER = 'RESET_ORDER';
export const SET_PAYMENT_STATUS = 'SET_PAYMENT_STATUS';

export const setAmountDetail = (amountDetail) => ({
  type: SET_AMOUNT_DETAIL,
  payload: {
    amountDetail,
  }
});

export const setRecipient = (recipient) => ({
  type: SET_RECIPIENT,
  payload: {
    recipient,
  }
});
export const setReference = (reference) => ({
  type: SET_REFERENCE,
  payload: {
    reference,
  }
});
export const setContactPerson = (contactPerson) => ({
  type: SET_CONTACT_PERSON,
  payload: {
    contactPerson,
  }
});

export const setOrder = (order) => ({
  type: SET_ORDER,
  payload: {
    order,
  }
});
export const setOrderErrors = (errors) => ({
  type: SET_ORDER_ERRORS,
  payload: {
    orderErrors: errors,
  }
});

export const setTokenExchange = (tokenExchange) => ({
  type: SET_TOKEN_EXCHANGE,
  payload: {
    tokenExchange,
  }
});

export const resetOrder = () => ({
  type: RESET_ORDER,
});

export const setPaymentStatus = (paymentStatus) => ({
  type: SET_PAYMENT_STATUS,
  payload: {
    paymentStatus,
  }
});

export const createOrder = () => async function (dispatch, getState)  {
  const state = getState();
  const fromAddress = getAddress(state);
  const recipient = getRecipient(state);
  const reference = getReference(state);
  const paymentDetail = getAmountDetail(state);
  const contactPerson = getContactPerson(state);

  try {
    const orderDetail = await Bity.order({
      fromAddress,
      recipient,
      paymentDetail: {
        inputCurrency: 'ETH',
        outputAmount: paymentDetail.amount,
        outputCurrency: paymentDetail.outputCurrency,
      },
      reference,
      contactPerson,
    });

    if(!orderDetail.input) {
      const cookieError = new Error('api_error');
      cookieError.errors = [{code: 'cookie', message: 'your browser does not support cookies'}];
      throw cookieError;
    }

    dispatch(setOrder(orderDetail));

    if(paymentDetail.inputCurrency !== 'ETH') {
      const tokenRate = await rateTokenForExactETH(paymentDetail.inputCurrency, orderDetail.input.amount);

      dispatch(setTokenExchange({ tokenRate }));
    }

    dispatch(setOrderErrors(null));

    // TODO register delete order after price guaranteed timeout
  } catch(error) {
    dispatch(setOrder(null));
    dispatch(setTokenExchange(null));

    if(error.message === 'api_error') {
      dispatch(setOrderErrors(error.errors));
    } else {
      console.error(error);
      dispatch(setOrderErrors([{code: 'unknown', message: 'unknown error'}]));
    }
  }
};

export const sendPayment = () => async function (dispatch, getState)  {
  const state = getState();
  const order = getOrder(state);
  const ethManager = getETHManager(getState());

  const { input: { amount }, payment_details: { crypto_address } } = order;

  dispatch(setPaymentStatus('approval'));
  try {
    const tx = await ethManager.send(crypto_address, amount);
    dispatch(setPaymentStatus('pending'));
    await ethManager.provider.waitForTransaction(tx.hash);
    dispatch(setPaymentStatus('mined'));
  } catch(error) {
    console.error(error);
    dispatch(setPaymentStatus('error'));
  }
};
