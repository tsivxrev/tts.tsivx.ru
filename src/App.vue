<script setup>
import { onMounted, reactive } from 'vue';
import { getCard } from './tts';

const state = reactive({
  is_loading: false,
  is_error: false,
  currentTimeout: 0,
  card_number: localStorage.getItem('card_number') || null,
  card: {},
  error: {},
});

const fetchCard = async () => {
  if (!state.card_number) return;
  state.card = {};
  state.is_loading = true;
  state.is_error = false;
  state.error = {};

  try {
    const { data } = await getCard(state.card_number);
    if (data.error) {
      state.is_error = true;
      state.error = data;
    }

    state.card = data;
    state.is_loading = false;
    localStorage.setItem('card_number', data.id);
  } catch (err) {
    state.is_loading = false;
    state.is_error = true;
    state.error = err?.response?.data || { message: 'Какая-то внутренняя ошибка ¯\\_(ツ)_/¯', details: err };
  }
};

const cardNumberRegex = /(\d{19})/;
const validateCardNumber = () => {
  if (cardNumberRegex.test(state.card_number)) {
    clearTimeout(state.currentTimeout);
    state.currentTimeout = setTimeout(async () => {
      fetchCard();
    }, 1000);
  }
};

onMounted(() => {
  fetchCard();
});

window.state = state;

</script>

<template>
  <div class="view h-full w-full max-w-md flex flex-col gap-4 items-center p-4 overflow-scroll">
    <div class="header w-full flex flex-col">
      <h1 class="title text-lg text-white font-bold">Мой ТТС <span class="ml-1 text-sm text-neutral-500 font-normal">beta</span></h1>
      <h2 class="subtitle text-neutral-500">Просмотр баланса транспортной карты Тюменской области (ТТС)</h2>
    </div>

    <div class="card-number w-full flex flex-col rounded-md">
      <label class="mb-1 text-sm text-neutral-500">Номер карты</label>
      <input @input="validateCardNumber" v-model="state.card_number" type="text" class="!outline-none w-full px-4 py-2 rounded-lg bg-neutral-800 text-white placeholder:text-neutral-500 disabled:text-neutral-500" placeholder="9990057230080149643">
    </div>

    <div v-if="state.is_loading" class="spinner w-full max-w-xl flex flex-col items-center">
      <svg class="text-neutral-600 animate-spin" fill="none" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg">
        <path clip-rule="evenodd" d="M16.394 5.077A8.2 8.2 0 0 0 4.58 15.49a.9.9 0 0 1-1.628.767A10 10 0 1 1 12 22a.9.9 0 0 1 0-1.8 8.2 8.2 0 0 0 4.394-15.123z" fill="currentColor" fill-rule="evenodd"/>
      </svg>
    </div>

    <div v-if="state.is_error" class="error w-full rounded-md text-white bg-neutral-800 px-4 py-2 flex flex-col">
      <div class="title text-lg font-bold">Упс! Произошла ошибка :(</div>
      <div class="message text-neutral-500">{{ state.error.message }}</div>
      <div class="mt-2 details font-mono text-sm text-neutral-500">{{ state.error.details }}</div>
    </div>

    <div v-if="state.card.id" class="card w-full flex flex-col gap-2 rounded-md p-4 bg-neutral-800">
      <div class="main flex flex-col">
        <div class="card-type font-medium text-white">Карта «{{ state.card.type }}»</div>
        <div class="card-balance font-bold text-2xl my-1 text-green-500">{{ state.card.balance }} ₽</div>
        <div class="card-number text-sm text-neutral-500">{{ state.card.id }}</div>
        <div class="card-updated text-sm text-neutral-500">Обновлено: {{ state.card.date }}</div>
      </div>

      <div class="options flex gap-2">
        <a @click="fetchCard" class="option refresh text-white font-medium flex gap-1 bg-neutral-700 rounded-md py-2 px-4 w-full justify-center cursor-pointer hover:bg-green-500 transition duration-300">
          <svg width="24px" height="24px" viewBox="0 0 24 24" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-2" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="replay_24">
                  <polygon id="Shape" points="0 0 24 0 24 24 0 24"></polygon>
                  <path d="M12,5 C16.418278,5 20,8.581722 20,13 C20,17.418278 16.418278,21 12,21 C7.581722,21 4,17.418278 4,13 C4,12.4477153 4.44771525,12 5,12 C5.55228475,12 6,12.4477153 6,13 C6,16.3137085 8.6862915,19 12,19 C15.3137085,19 18,16.3137085 18,13 C18,9.6862915 15.3137085,7 12,7 L12,10.0957793 C12,10.1952857 11.9629113,10.2912196 11.895976,10.3648484 C11.7473732,10.5283115 11.4943939,10.5403581 11.3309309,10.3917553 L7.04262272,6.49329338 C7.02697148,6.47906498 7.01200627,6.46409977 6.99777787,6.44844853 C6.75010658,6.17601012 6.77018431,5.7543779 7.04262272,5.50670662 L11.3309309,1.60824468 C11.4045596,1.54130941 11.5004936,1.5042207 11.6,1.5042207 C11.8209139,1.5042207 12,1.68330681 12,1.90422072 L12,5 Z" id="Mask" fill="currentColor"></path>
                </g>
            </g>
          </svg>
          <div class="caption">Обновить</div>
        </a>
        <a :href="`https://tmn.pay2way.ru/tcard/?c=${state.card.id}`" target="_blank" class="option pay text-white font-medium flex gap-1 bg-neutral-700 rounded-md py-2 px-4 w-full justify-center cursor-pointer hover:bg-green-500 transition duration-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.795 3.1c1.152 0 1.74.113 2.35.44.565.302 1.013.75 1.315 1.314.301.565.421 1.108.438 2.095l.002.256V12a.9.9 0 0 1-1.793.113L20.1 12l-.001-3.1h-16.2l.001 5.895c0 .88.06 1.187.228 1.502.134.25.325.441.575.575.29.156.574.218 1.309.227l.193.001h12.622l-1.463-1.464a.9.9 0 0 1-.081-1.18l.08-.092a.9.9 0 0 1 1.181-.081l.092.08 3 3a.9.9 0 0 1 .08 1.181l-.08.092-3 3a.9.9 0 0 1-1.353-1.18l.08-.092 1.464-1.464H6.205c-1.063 0-1.646-.097-2.21-.369l-.14-.071a3.172 3.172 0 0 1-1.315-1.315c-.301-.564-.421-1.107-.438-2.094l-.002-.256v-7.59c0-1.152.113-1.74.44-2.35A3.171 3.171 0 0 1 3.854 3.54c.565-.301 1.108-.421 2.095-.438l.256-.002h11.59Zm0 1.8H6.205c-.88 0-1.187.06-1.502.228-.25.134-.441.325-.575.575-.156.29-.218.574-.227 1.309L3.9 7.1h16.198v-.088c-.008-.735-.07-1.018-.226-1.309a1.372 1.372 0 0 0-.575-.575c-.291-.156-.575-.218-1.309-.227l-.193-.001Z"/>
          </svg>
          <div class="caption">Пополнить</div>
        </a>
      </div>
    </div>

    <div v-if="state.card.id" class="history flex flex-col gap-1 w-full">
      <div v-for="event in state.card.history" :key="event.date" class="event flex flex-col bg-neutral-800 p-4 rounded-md gap-2">
        <div class="event-summary w-full flex justify-between items-center">
          <div class="left flex items-center w-full">
            <div class="route-number p-2 text-xl text-green-500 font-bold">{{ event.routeNumber }}</div>
            <div class="route-name p-2 text-white rounded-lg">{{ event.routeName }}</div>
          </div>

          <div class="right flex flex-col items-center">
            <div class="sum text-green-500 font-bold text-lg rounded-lg">{{ event.parsedSum }}</div>
            <div class="date text-sm text-center text-neutral-500">{{ event.parsedDate }}</div>
          </div>
        </div>

        <div class="line w-full bg-neutral-700 h-[1px]"></div>

        <div class="event-details flex flex-col text-neutral-500 text-sm">
          <div class="balance">Баланс: {{ event.balance }} ₽</div>
          <div class="exemption-balance">Остаток льготных поездок: {{ event.exemption_balance }}</div>
          <div class="agent">Агент: {{ event.agent }}</div>
        </div>
      </div>
    </div>

    <div class="footer flex flex-col gap-2 text-center text-neutral-500 text-sm">
      <div class="disclaimer">Данные о транспортной карте предоставлены сервисом <a href="https://tgt72.ru" target="_blank" class="font-medium text-green-500">tgt72.ru</a> Также вы можете воспользоваться <a href="https://vk.com/tts_app" target="_blank" class="font-medium text-green-500">чат-ботом ВКонтакте</a></div>
      <div class="author">made with love by <a href="https://t.me/tsivxrev" target="_blank" class="font-medium text-green-500">@tsivxrev</a></div>
    </div>
  </div>
</template>
