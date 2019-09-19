<template>
	<div id="app">
		<div id="nav">
			<router-link to="/">前往com项目Home页面</router-link>|
			<router-link to="/comm-about">前往com项目About页面</router-link>|
			<router-link to="/test1-home">前往test1项目Home页面</router-link>|
			<router-link to="/test1-about">前往test1项目About页面</router-link>
		</div>
		<router-view />
	</div>
</template>

<style lang="scss">
#app {
	font-family: "Avenir", Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#nav {
	padding: 30px;

	a {
		font-weight: bold;
		color: #2c3e50;
    
		&.router-link-exact-active {
			color: #42b983;
		}
	}
}
</style>
