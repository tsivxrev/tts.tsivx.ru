import axios from 'axios';
import MD5 from 'crypto-js/md5';
import dayjs from 'dayjs';
import 'dayjs/locale/ru';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.locale('ru');
dayjs.extend(customParseFormat);

const instance = axios.create({
  baseURL: 'https://api.tgt72.ru/api/',
});

class APIError extends Error {
  constructor(message) {
    super(message);
    this.name = 'APIError';
    this.title = message.title;
    this.message = message.message;
    this.details = message.details;
  }
}

export const todo = 'todo';
export const vgetCard = async (id) => {
  const date = dayjs().format('DD.MM.YYYY');
  const hash = MD5(`${date}.${id}`).toString();

  try {
    const response = await instance.get('/v5/balance', {
      params: {
        card: id,
        hash,
      },
    });

    if (typeof response.data === 'string') {
      throw new Error(response.data);
    }

    const card = {
      id: response.data.card,
      type: response.data.ltype,
      updated_at: response.data.date,
      balance: response.data.balance.toFixed(2), // .toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '),
      exemption: {
        balance: response.data.exemption_balance,
        limit: response.data.exemption_limit,
      },
      history_summary: 0,
      history: response.data.history.map((event) => ({
        agent: event.agent,
        balance: event.balance,
        date: dayjs(event.date, 'DD.MM.YY hh:mm:ss'),
        sum: event.sum.toFixed(2),
        type: event.type,
        exemption_balance: event.exemption_balance,
        route_number: event.route.split('.')[0],
        route_name: event.route.replace(`${event.route.split('.')[0]}.`, '').trim(),
      })).reverse(),
    };

    card.history.forEach((event) => { card.history_summary += +event.sum; });
    card.history_summary = card.history_summary.toFixed(2);

    return card;
  } catch (error) {
    throw new APIError({
      title: 'Произошла ошибка на сервере',
      message: 'Проверьте правильность написания номера карты и повторите попытку позже.',
      details: error?.response?.data || error.message,
    });
  }
};

window.card = vgetCard;
