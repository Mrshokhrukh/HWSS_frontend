<template>
    <div class="card p-4 d-flex justify-content-center align-items-center">
        <div class="w-100">
            <div class="row g-2">
                <div class="col-3">
                    <div class="input-group mb-3">
                        <span class="input-group-text" id="basic-addon1"><i class="fa fa-search"></i></span>
                        <input type="text" class="form-control" placeholder="Search" aria-label="Search"
                            aria-describedby="basic-addon1">
                    </div>
                </div>
                <div class="col-3">
                    <select class="form-select" aria-label="Default select example">
                        <option selected>Open this select menu</option>
                        <option value="1">One</option>
                        <option value="2">Two</option>
                        <option value="3">Three</option>
                    </select>
                </div>
                <div class="col-3">
                    <div class="input-group">
                        <span class="input-group-text" id="basic-addon2">$</span>
                        <input type="text" class="form-control" placeholder="Amount" aria-label="Username"
                            aria-describedby="basic-addon2">
                    </div>
                </div>
                <div class="col-3">
                    <div class="slider-tool">
                        <input type="range" class="form-range" min="0" max="100">
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
</script>

<style scoped>
.slider-tool {
    height: 40px;
}
</style>


