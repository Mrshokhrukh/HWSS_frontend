<template>
    <div class="row mt-5">
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title text-center bold" style="color: #2c6975;">Independent Screening Overview</h5>
                        <canvas ref="chartLeft"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-md-6">
                <div class="card">
                    <div class="card-body">
                        <h5 class="card-title text-center bold" style="color: #2c6975;"> Cluster Screening Overview</h5>
                        <canvas ref="chartRight"></canvas>
                    </div>
                </div>
            </div>
        </div>
</template>