<template>
  <el-container>
    <el-container>
      <el-aside width="182px" class="el-aside">
        <el-menu
            :router="true"
            class="el-menu"
            default-active="1">
          <el-submenu index="collections">
            <template slot="title">
              <i class="el-icon-folder"></i>
              <span>集合管理</span>
            </template>
            <el-menu-item index="/collect/create">创建集合</el-menu-item>
            <el-menu-item index="/collect/remove">删除集合</el-menu-item>
            <el-menu-item index="/collect/view">查看集合</el-menu-item>
            <el-menu-item index="/collect/list">集合列表</el-menu-item>
          </el-submenu>
          <el-submenu index="sample">
            <template slot="title">
              <i class="el-icon-tickets"></i>
              <span>样本管理</span>
            </template>
            <el-menu-item index="/sample/create">创建样本</el-menu-item>
            <el-menu-item index="/sample/remove">删除样本</el-menu-item>
            <el-menu-item index="/sample/view">查看样本</el-menu-item>
            <el-menu-item index="/sample/list">样本列表</el-menu-item>
<!--            <el-menu-item index="/sample/update">更新样本</el-menu-item>-->
          </el-submenu>
          <el-submenu index="face">
            <template slot="title">
              <i class="el-icon-document"></i>
              <span>数据管理</span>
            </template>
            <el-menu-item index="/face/create">创建数据</el-menu-item>
<!--            <el-menu-item index="/face/remove">删除数据</el-menu-item>-->
          </el-submenu>
          <el-submenu index="search">
            <template slot="title">
              <i class="el-icon-search"></i>
              <span>搜索服务</span>
            </template>
            <el-menu-item index="/search/mVn">一对多搜索</el-menu-item>
          </el-submenu>
          <el-submenu index="compare">
            <template slot="title">
              <i class="el-icon-view"></i>
              <span>比对服务</span>
            </template>
            <el-menu-item index="/compare/1v1">一对一比对</el-menu-item>
          </el-submenu>
<!--          <el-submenu index="common">-->
<!--            <template slot="title">-->
<!--              <i class="el-icon-reading"></i>-->
<!--              <span>公共服务</span>-->
<!--            </template>-->
<!--            <el-menu-item index="/common/health/check">服务健康检测</el-menu-item>-->
<!--          </el-submenu>-->
        </el-menu>
      </el-aside>
      <el-main>
        <router-view/>
      </el-main>
    </el-container>
  </el-container>
</template>

<script>
export default {
  name: 'Home',
  components: {
  }
}
</script>

<style>
.el-aside {
  background-color: #D3DCE6;
  color: #333;
  text-align: center;
  line-height: 200px;
  height: calc(100vh);
  width: 182px;
  overflow-x: hidden;
}

.el-main {
  background-color: white;
  color: #333;
  height: calc(100vh);
}

.el-menu {
  height: 100%;
  overflow-x: hidden;
}
</style>
