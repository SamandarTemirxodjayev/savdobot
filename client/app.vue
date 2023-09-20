<template>
  <div>
    <table class="table">
      <thead>
        <tr>
          <th class="border">Type</th>
          <th class="border">Price</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td class="border">60</td>
          <td class="custom-borderless">
            <input id="price60" type="text" v-model="price60" />
          </td>
        </tr>
        <tr>
          <td class="border">325</td>
          <td class="custom-borderless">
            <input id="price325" type="text" v-model="price325" />
          </td>
        </tr>
        <tr>
          <td class="border">660</td>
          <td class="custom-borderless">
            <input id="price660" type="text" v-model="price660" />
          </td>
        </tr>
        <tr>
          <td class="border">1800</td>
          <td class="custom-borderless">
            <input id="price1800" type="text" v-model="price1800" />
          </td>
        </tr>
        <tr>
          <td class="border">3850</td>
          <td class="custom-borderless">
            <input id="price3850" type="text" v-model="price3850" />
          </td>
        </tr>
        <tr>
          <td class="border">8100</td>
          <td class="custom-borderless">
            <input id="price8100" type="text" v-model="price8100" />
          </td>
        </tr>
      </tbody>
    </table>
    <button class="button" @click="handleSave">Save</button>
  </div>
</template>
<script setup>
import axios from "axios";
const price = ref();
const price60 = ref();
const price325 = ref();
const price660 = ref();
const price1800 = ref();
const price3850 = ref();
const price8100 = ref();
onMounted(async () => {
  const res = await axios.get("http://45.144.233.240:3001/api/prices");
  price.value = res.data;
  price60.value = res.data.price[60];
  price325.value = res.data.price[325];
  price660.value = res.data.price[660];
  price1800.value = res.data.price[1800];
  price3850.value = res.data.price[3850];
  price8100.value = res.data.price[8100];
});
const handleSave = async () => {
  const res = await axios.put(
    "http://45.144.233.240:3001/api/prices",
    {
      price: {
        60: price60.value,
        325: price325.value,
        660: price660.value,
        1800: price1800.value,
        3850: price3850.value,
        8100: price8100.value,
      },
    }
  );
  price.value = res.data;
}
</script>
<style scoped>
.table {
  width: 100%;
  border: 1px solid black;
  font-size: 26px;
  text-align: center;
}

.border {
  border: 1px solid black;
}

.custom-borderless {
  border: 1px solid black;
  padding: 5px;
}

.custom-borderless input[type="text"] {
  border: none;
  outline: none;
  font-size: 26px;
}

.button {
  width: 100%;
  height: 50px;
  border: 1px solid black;
  font-size: 26px;
  text-align: center;
  margin-top: 20px;
  cursor: pointer;
  color: white;
  background-color: black;
  border-radius: 5px;
  outline: none;
  transition: 0.5s;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}
</style>