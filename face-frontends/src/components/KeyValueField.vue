<template>
  <el-table :data="value">
    <el-table-column label="操作" width="60px">
      <template slot="header">
        <el-button size="mini" icon="el-icon-plus" type="primary" @click="handleAdd" circle></el-button>
      </template>
      <template slot-scope="scope">
        <el-button size="mini" icon="el-icon-delete" type="danger" @click="handleDelete(scope)" circle></el-button>
      </template>
    </el-table-column>
    <el-table-column prop="name" label="名称">
      <template slot-scope="scope">
        <el-input size="mini" v-model="scope.row.key"/>
      </template>
    </el-table-column>
    <el-table-column prop="dataType" label="值">
      <template slot-scope="scope">
        <el-input size="mini" v-model="scope.row.value"/>
      </template>
    </el-table-column>
  </el-table>
</template>

<script>
export default {
  name: "KeyValueField",
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: Array,
      default: () => {
        return []
      }
    }
  },
  methods: {
    handleAdd () {
      this.value.push({})
    },
    handleDelete (scope) {
      this.$delete(this.value, scope.$index)
    }
  }
}
</script>

<style scoped>

</style>
