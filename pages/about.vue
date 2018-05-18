<template>
  <v-container>
    <v-layout>
      <v-flex text-xs-center>
        <img src="/v.png" alt="Vuetify.js" class="mb-5">
        <blockquote class="blockquote">
          &#8220;First, solve the problem. Then, write the code.&#8221;
          <footer>
            <small>
              <em>&mdash;John Johnson</em>
            </small>
          </footer>
        </blockquote>
      </v-flex>
    </v-layout>
  </v-container>
</template>

<script>
  export default {
    head () {
      return {
        title: `About - reddit.guide`,
        meta: [
          { hid: 'description', name: 'description', content: `Find out more about reddit.guide` },
          { hid: 'og:description', property: 'og:description', content: `Find out more about reddit.guide` },
          { hid: 'og:title', property: 'og:title', content: `About - reddit.guide` },
          { hid: 'og:url', property: 'og:url', content: `https://reddit.guide/about/` }
        ]
      }
    }
  }
</script>
