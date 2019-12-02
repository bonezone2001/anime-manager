<template>
  <div class="main" :class="this.$store.getters.isCollapsed ? 'collapsed' : ''">
    <h1>Ah i will do this eventually</h1>
  </div>
</template>

<script>
export default {
  data() {
    return {
      collapsedClass: "collapsed"
    };
  }
};
</script>