<template> 
  <version-detail :is-edit='false'></version-detail>
</template>
<script>
  import VersionDetail from '../components/VersionDetail'
  export default {
    name: 'addVersion',
    components: { VersionDetail }
  }
</script>
<style>
</style>
