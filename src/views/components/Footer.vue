<template>
	<v-footer dark padless width="100vw" inset elevation="4">
		<v-card flat tile class="accent-3 white--text text-center">
			<v-card-text class="white--text pt-0 the-footer">
				Intech Degree - A Degree Verification System - City University of London
			</v-card-text>

			<v-divider />

			<v-card-text class="white--text">
				{{ new Date().getFullYear() }} — <strong>Designed by Adama Sambou</strong>
			</v-card-text>
		</v-card>
	</v-footer>
</template>

<script>
export default
{
	name: "Footer"
}

</script>

<style scoped>

</style>